import type { Task, EnergyLog, UserPreferences, EnergyLevel } from '@/types';

// Default circadian energy curve (hour -> 1-5 score)
const CIRCADIAN_CURVE: Record<number, number> = {
  6: 2, 7: 3, 8: 3.5, 9: 4.5, 10: 5, 11: 4.5,
  12: 3.5, 13: 3, 14: 3.5, 15: 4, 16: 4, 17: 3.5,
  18: 3, 19: 2.5, 20: 2, 21: 2, 22: 1.5, 23: 1,
};

const EFFORT_SCORE: Record<string, number> = {
  low: 1,
  medium: 2.5,
  high: 5,
};

interface TimeSlot {
  start: Date;
  end: Date;
  predictedEnergy: number;
}

function buildHourlyEnergyProfile(logs: EnergyLog[]): Record<number, number> {
  const hourBuckets: Record<number, number[]> = {};

  logs.forEach((log) => {
    const hour = log.timestamp.getHours();
    if (!hourBuckets[hour]) hourBuckets[hour] = [];
    hourBuckets[hour].push(log.energy);
  });

  const profile: Record<number, number> = {};
  for (let h = 6; h <= 23; h++) {
    if (hourBuckets[h] && hourBuckets[h].length > 0) {
      profile[h] = hourBuckets[h].reduce((a, b) => a + b, 0) / hourBuckets[h].length;
    } else {
      profile[h] = CIRCADIAN_CURVE[h] || 3;
    }
  }
  return profile;
}

function parseTime(timeStr: string, baseDate: Date): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

function buildFreeSlots(preferences: UserPreferences, date: Date, scheduledTasks: Task[]): TimeSlot[] {
  const energyProfile = buildHourlyEnergyProfile([]);
  const workStart = parseTime(preferences.workStartTime, date);
  const workEnd = parseTime(preferences.workEndTime, date);

  const slots: TimeSlot[] = [];

  // Walk through each 30-min slot in work hours
  const current = new Date(workStart);
  while (current < workEnd) {
    const slotEnd = new Date(current.getTime() + 30 * 60 * 1000);

    // Check if this slot overlaps with meal times
    const mealTimes = [
      preferences.mealTimes.breakfast,
      preferences.mealTimes.lunch,
      preferences.mealTimes.dinner,
    ].map((t) => parseTime(t, date));

    const overlappsMeal = mealTimes.some((mealTime) => {
      const mealEnd = new Date(mealTime.getTime() + 30 * 60 * 1000);
      return current < mealEnd && slotEnd > mealTime;
    });

    // Check if slot overlaps with already-scheduled tasks
    const overlapsTasks = scheduledTasks.some((t) => {
      if (!t.scheduledTime) return false;
      const taskEnd = new Date(t.scheduledTime.getTime() + t.duration * 60 * 1000);
      return current < taskEnd && slotEnd > t.scheduledTime;
    });

    if (!overlappsMeal && !overlapsTasks) {
      const hour = current.getHours();
      slots.push({
        start: new Date(current),
        end: slotEnd,
        predictedEnergy: energyProfile[hour] || 3,
      });
    }

    current.setTime(current.getTime() + 30 * 60 * 1000);
  }

  return slots;
}

function mergeConsecutiveSlots(slots: TimeSlot[]): TimeSlot[] {
  if (slots.length === 0) return [];
  const merged: TimeSlot[] = [{ ...slots[0] }];

  for (let i = 1; i < slots.length; i++) {
    const last = merged[merged.length - 1];
    if (slots[i].start.getTime() === last.end.getTime()) {
      last.end = slots[i].end;
      last.predictedEnergy = (last.predictedEnergy + slots[i].predictedEnergy) / 2;
    } else {
      merged.push({ ...slots[i] });
    }
  }
  return merged;
}

export function autoScheduleTasks(
  tasks: Task[],
  energyLogs: EnergyLog[],
  preferences: UserPreferences,
  date: Date = new Date()
): Task[] {
  const energyProfile = buildHourlyEnergyProfile(energyLogs);
  const alreadyScheduled = tasks.filter((t) => !t.completed && t.scheduledTime);
  const toSchedule = tasks.filter((t) => !t.completed && !t.scheduledTime);

  if (toSchedule.length === 0) return tasks;

  const freeSlots = buildFreeSlots(preferences, date, alreadyScheduled);
  const mergedSlots = mergeConsecutiveSlots(freeSlots);

  // Sort tasks: highest importance first, then effort (high effort gets high energy slots)
  const sortedTasks = [...toSchedule].sort((a, b) => b.importance - a.importance);

  const updatedTasks = tasks.map((t) => ({ ...t }));
  const usedSlots = new Set<number>();

  for (const task of sortedTasks) {
    const neededMinutes = task.duration;
    let bestSlot: TimeSlot | null = null;
    let bestScore = -Infinity;
    let bestSlotIdx = -1;

    mergedSlots.forEach((slot, idx) => {
      if (usedSlots.has(idx)) return;
      const slotMinutes = (slot.end.getTime() - slot.start.getTime()) / 60000;
      if (slotMinutes < neededMinutes) return;

      const effortScore = EFFORT_SCORE[task.effort] || 2.5;
      const energyMatch = slot.predictedEnergy / effortScore;
      const score = energyMatch * task.importance;

      if (score > bestScore) {
        bestScore = score;
        bestSlot = slot;
        bestSlotIdx = idx;
      }
    });

    if (bestSlot && bestSlotIdx >= 0) {
      const taskIdx = updatedTasks.findIndex((t) => t.id === task.id);
      if (taskIdx >= 0) {
        updatedTasks[taskIdx] = { ...updatedTasks[taskIdx], scheduledTime: (bestSlot as TimeSlot).start };
      }

      // Shrink or remove the used slot
      const slotDurationMs = neededMinutes * 60 * 1000;
      const newSlotStart = new Date((bestSlot as TimeSlot).start.getTime() + slotDurationMs);
      if (newSlotStart < (bestSlot as TimeSlot).end) {
        mergedSlots[bestSlotIdx] = { ...(bestSlot as TimeSlot), start: newSlotStart };
      } else {
        usedSlots.add(bestSlotIdx);
      }
    }
  }

  return updatedTasks;
}

export function predictEnergyForTime(hour: number, energyLogs: EnergyLog[]): EnergyLevel {
  const profile = buildHourlyEnergyProfile(energyLogs);
  const raw = profile[hour] || 3;
  return Math.max(1, Math.min(5, Math.round(raw))) as EnergyLevel;
}
