import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { EnergyLog, EnergyLevel, MoodLevel } from '@/types';
import { toast } from 'sonner';

interface DbEnergyLog {
  id: string;
  user_id: string;
  energy: number;
  mood: number;
  notes: string | null;
  timestamp: string;
}

function mapDbToLog(db: DbEnergyLog): EnergyLog {
  return {
    id: db.id,
    energy: db.energy as EnergyLevel,
    mood: db.mood as MoodLevel,
    notes: db.notes || undefined,
    timestamp: new Date(db.timestamp),
  };
}

export function useEnergyLogs() {
  const { user } = useAuth();
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setEnergyLogs([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('energy_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setEnergyLogs((data || []).map(mapDbToLog));
    } catch (error) {
      console.error('Error fetching energy logs:', error);
      toast.error('Kon energie-logs niet laden');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = async (energy: EnergyLevel, mood: MoodLevel, notes?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('energy_logs')
        .insert({
          user_id: user.id,
          energy,
          mood,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      setEnergyLogs((prev) => [mapDbToLog(data), ...prev]);
      toast.success('Energie opgeslagen');
    } catch (error) {
      console.error('Error adding energy log:', error);
      toast.error('Kon energie niet opslaan');
    }
  };

  const getLatestLog = (): EnergyLog | null => {
    return energyLogs.length > 0 ? energyLogs[0] : null;
  };

  return {
    energyLogs,
    loading,
    addLog,
    getLatestLog,
    refetch: fetchLogs,
  };
}
