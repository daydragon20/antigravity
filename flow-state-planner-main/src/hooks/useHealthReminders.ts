import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { HealthReminder, ReminderType } from '@/types';
import { toast } from 'sonner';

interface DbReminder {
  id: string;
  user_id: string;
  type: 'meal' | 'movement' | 'rest';
  title: string;
  scheduled_time: string;
  completed: boolean;
  duration: number | null;
  created_at: string;
}

function mapDbToReminder(db: DbReminder): HealthReminder {
  return {
    id: db.id,
    type: db.type as ReminderType,
    title: db.title,
    scheduledTime: new Date(db.scheduled_time),
    completed: db.completed,
    duration: db.duration || undefined,
  };
}

export function useHealthReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('health_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setReminders((data || []).map(mapDbToReminder));
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Kon herinneringen niet laden');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const addReminder = async (reminderData: Omit<HealthReminder, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('health_reminders')
        .insert({
          user_id: user.id,
          type: reminderData.type,
          title: reminderData.title,
          scheduled_time: reminderData.scheduledTime.toISOString(),
          completed: reminderData.completed,
          duration: reminderData.duration || null,
        })
        .select()
        .single();

      if (error) throw error;
      setReminders((prev) => [...prev, mapDbToReminder(data)].sort(
        (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
      ));
      toast.success('Herinnering toegevoegd');
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Kon herinnering niet toevoegen');
    }
  };

  const toggleReminderComplete = async (id: string) => {
    if (!user) return;

    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    try {
      const { error } = await supabase
        .from('health_reminders')
        .update({ completed: !reminder.completed })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
      );
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast.error('Kon herinnering niet bijwerken');
    }
  };

  const deleteReminder = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('health_reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success('Herinnering verwijderd');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Kon herinnering niet verwijderen');
    }
  };

  return {
    reminders,
    loading,
    addReminder,
    toggleReminderComplete,
    deleteReminder,
    refetch: fetchReminders,
  };
}
