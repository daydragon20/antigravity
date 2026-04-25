import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Habit, HabitLog } from '@/types';
import { toast } from 'sonner';
import { format, subDays, differenceInCalendarDays } from 'date-fns';

interface DbHabit {
  id: string;
  user_id: string;
  title: string;
  frequency: string;
  target_count: number;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

interface DbHabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
}

function mapDbToHabit(db: DbHabit): Habit {
  return {
    id: db.id,
    userId: db.user_id,
    title: db.title,
    frequency: db.frequency as Habit['frequency'],
    targetCount: db.target_count,
    color: db.color,
    icon: db.icon,
    createdAt: new Date(db.created_at),
  };
}

function mapDbToHabitLog(db: DbHabitLog): HabitLog {
  return {
    id: db.id,
    habitId: db.habit_id,
    userId: db.user_id,
    completedAt: db.completed_at,
  };
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setHabitLogs([]);
      setLoading(false);
      return;
    }

    try {
      const [habitsRes, logsRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('completed_at', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
          .order('completed_at', { ascending: false }),
      ]);

      if (habitsRes.error) throw habitsRes.error;
      if (logsRes.error) throw logsRes.error;

      setHabits((habitsRes.data || []).map(mapDbToHabit));
      setHabitLogs((logsRes.data || []).map(mapDbToHabitLog));
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: habitData.title,
          frequency: habitData.frequency,
          target_count: habitData.targetCount,
          color: habitData.color,
          icon: habitData.icon,
        })
        .select()
        .single();

      if (error) throw error;
      setHabits((prev) => [...prev, mapDbToHabit(data)]);
      toast.success('Gewoonte toegevoegd');
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Kon gewoonte niet toevoegen');
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setHabitLogs((prev) => prev.filter((l) => l.habitId !== id));
      toast.success('Gewoonte verwijderd');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Kon gewoonte niet verwijderen');
    }
  };

  const logHabit = async (habitId: string, date?: string) => {
    if (!user) return;
    const dateStr = date || format(new Date(), 'yyyy-MM-dd');
    const alreadyLogged = habitLogs.some((l) => l.habitId === habitId && l.completedAt === dateStr);

    if (alreadyLogged) {
      // Toggle off
      try {
        const log = habitLogs.find((l) => l.habitId === habitId && l.completedAt === dateStr);
        if (!log) return;
        const { error } = await supabase.from('habit_logs').delete().eq('id', log.id);
        if (error) throw error;
        setHabitLogs((prev) => prev.filter((l) => l.id !== log.id));
      } catch (error) {
        console.error('Error removing habit log:', error);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, completed_at: dateStr })
        .select()
        .single();

      if (error) throw error;
      setHabitLogs((prev) => [mapDbToHabitLog(data), ...prev]);
      toast.success('Gewoonte gelogd! 🔥');
    } catch (error) {
      console.error('Error logging habit:', error);
      toast.error('Kon gewoonte niet loggen');
    }
  };

  const getStreak = (habitId: string): number => {
    const logs = habitLogs
      .filter((l) => l.habitId === habitId)
      .map((l) => l.completedAt)
      .sort()
      .reverse();

    if (logs.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (logs.includes(dateStr)) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else if (i === 0) {
        // Allow today to be missed — check yesterday
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const isLoggedToday = (habitId: string): boolean => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return habitLogs.some((l) => l.habitId === habitId && l.completedAt === today);
  };

  const getLast7Days = (habitId: string): { date: string; completed: boolean }[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      return {
        date,
        completed: habitLogs.some((l) => l.habitId === habitId && l.completedAt === date),
      };
    });
  };

  return {
    habits,
    habitLogs,
    loading,
    addHabit,
    deleteHabit,
    logHabit,
    getStreak,
    isLoggedToday,
    getLast7Days,
    refetch: fetchHabits,
  };
}
