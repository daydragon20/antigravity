import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, EffortLevel, ImportanceLevel } from '@/types';
import { toast } from 'sonner';

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  effort: 'low' | 'medium' | 'high';
  importance: number;
  deadline: string | null;
  scheduled_time: string | null;
  duration: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

function mapDbToTask(db: DbTask): Task {
  return {
    id: db.id,
    title: db.title,
    description: db.description || undefined,
    effort: db.effort as EffortLevel,
    importance: db.importance as ImportanceLevel,
    deadline: db.deadline ? new Date(db.deadline) : undefined,
    scheduledTime: db.scheduled_time ? new Date(db.scheduled_time) : undefined,
    duration: db.duration,
    completed: db.completed,
    createdAt: new Date(db.created_at),
  };
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []).map(mapDbToTask));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Kon taken niet laden');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          description: taskData.description || null,
          effort: taskData.effort,
          importance: taskData.importance,
          deadline: taskData.deadline?.toISOString() || null,
          scheduled_time: taskData.scheduledTime?.toISOString() || null,
          duration: taskData.duration,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => [mapDbToTask(data), ...prev]);
      toast.success('Taak toegevoegd');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Kon taak niet toevoegen');
    }
  };

  const updateTask = async (updatedTask: Task) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description || null,
          effort: updatedTask.effort,
          importance: updatedTask.importance,
          deadline: updatedTask.deadline?.toISOString() || null,
          scheduled_time: updatedTask.scheduledTime?.toISOString() || null,
          duration: updatedTask.duration,
          completed: updatedTask.completed,
        })
        .eq('id', updatedTask.id)
        .eq('user_id', user.id);

      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Kon taak niet bijwerken');
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Taak verwijderd');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Kon taak niet verwijderen');
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    await updateTask({ ...task, completed: !task.completed });
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    refetch: fetchTasks,
  };
}
