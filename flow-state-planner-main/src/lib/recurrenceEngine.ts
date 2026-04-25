import type { Task, RecurrenceRule } from '@/types';
import { addDays, addWeeks, addMonths, isBefore } from 'date-fns';

export function generateRecurrences(
  parentTask: Task,
  until: Date
): Omit<Task, 'id' | 'createdAt' | 'completed'>[] {
  if (!parentTask.recurrenceRule) return [];

  const instances: Omit<Task, 'id' | 'createdAt' | 'completed'>[] = [];
  const baseDate = parentTask.deadline || parentTask.scheduledTime || new Date();
  let current = advanceDate(baseDate, parentTask.recurrenceRule);
  const endDate = parentTask.recurrenceEndDate || until;

  while (isBefore(current, endDate) && instances.length < 52) {
    instances.push({
      title: parentTask.title,
      description: parentTask.description,
      effort: parentTask.effort,
      importance: parentTask.importance,
      duration: parentTask.duration,
      category: parentTask.category,
      source: 'manual',
      recurrenceRule: parentTask.recurrenceRule,
      recurrenceEndDate: parentTask.recurrenceEndDate,
      parentTaskId: parentTask.id,
      deadline: parentTask.deadline ? current : undefined,
      scheduledTime: parentTask.scheduledTime ? current : undefined,
    });
    current = advanceDate(current, parentTask.recurrenceRule);
  }

  return instances;
}

function advanceDate(date: Date, rule: RecurrenceRule): Date {
  switch (rule) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addWeeks(date, 1);
    case 'monthly':
      return addMonths(date, 1);
  }
}
