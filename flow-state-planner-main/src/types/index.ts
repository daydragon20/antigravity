// Core types for Flow State — AI-powered life operating system

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EffortLevel = 'low' | 'medium' | 'high';
export type ImportanceLevel = 1 | 2 | 3 | 4 | 5;
export type TaskCategory = 'work' | 'health' | 'creative' | 'social' | 'admin' | 'other';
export type TaskSource = 'google' | 'outlook' | 'manual';
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly';
export type ThemeMode = 'light' | 'dark' | 'system';
export type WearableProvider = 'garmin' | 'fitbit' | 'oura' | 'apple_health' | 'samsung_health';
export type SubscriptionPlan = 'free' | 'pro';

export interface Task {
  id: string;
  title: string;
  description?: string;
  effort: EffortLevel;
  importance: ImportanceLevel;
  deadline?: Date;
  scheduledTime?: Date;
  duration: number; // in minutes
  completed: boolean;
  createdAt: Date;
  category?: TaskCategory;
  externalId?: string;
  source?: TaskSource;
  recurrenceRule?: RecurrenceRule;
  recurrenceEndDate?: Date;
  parentTaskId?: string;
}

export interface EnergyLog {
  id: string;
  timestamp: Date;
  energy: EnergyLevel;
  mood: MoodLevel;
  notes?: string;
}

export type ReminderType = 'meal' | 'movement' | 'rest';

export interface HealthReminder {
  id: string;
  type: ReminderType;
  title: string;
  scheduledTime: Date;
  completed: boolean;
  duration?: number; // in minutes
}

export interface TimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  type: 'task' | 'meal' | 'movement' | 'rest' | 'free';
  item?: Task | HealthReminder;
  predictedEnergy?: EnergyLevel;
}

export interface DailyPlan {
  date: Date;
  blocks: TimeBlock[];
  energyLogs: EnergyLog[];
  tasks: Task[];
  reminders: HealthReminder[];
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string; // DATE string "YYYY-MM-DD"
}

export interface UserPreferences {
  name: string;
  theme: ThemeMode;
  wakeTime: string; // "07:00"
  sleepTime: string; // "23:00"
  mealTimes: { breakfast: string; lunch: string; dinner: string };
  snackTimes: string[];
  maxTasksPerBlock: number;
  breakDuration: number; // minutes
  movementInterval: number; // minutes between movement reminders
  workStartTime: string;
  workEndTime: string;
  subscription?: SubscriptionPlan;
}

export const defaultPreferences: UserPreferences = {
  name: '',
  theme: 'system',
  wakeTime: '07:00',
  sleepTime: '23:00',
  mealTimes: { breakfast: '08:00', lunch: '12:30', dinner: '18:30' },
  snackTimes: ['10:30', '15:30'],
  maxTasksPerBlock: 3,
  breakDuration: 15,
  movementInterval: 90,
  workStartTime: '09:00',
  workEndTime: '17:00',
  subscription: 'free',
};

export type TabId = 'home' | 'tasks' | 'braindump' | 'focus' | 'coach' | 'energy' | 'habits' | 'insights' | 'settings';
