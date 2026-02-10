import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserPreferences } from '@/types';
import { defaultPreferences } from '@/types';
import { toast } from 'sonner';

interface DbProfile {
    id: string;
    user_id: string;
    name: string | null;
    theme: string | null;
    wake_time: string | null;
    sleep_time: string | null;
    meal_times: { breakfast: string; lunch: string; dinner: string } | null;
    snack_times: string[] | null;
    max_tasks_per_block: number | null;
    break_duration: number | null;
    movement_interval: number | null;
    work_start_time: string | null;
    work_end_time: string | null;
    notifications_enabled: boolean | null;
    created_at: string;
    updated_at: string;
}

function mapDbToPreferences(db: DbProfile): UserPreferences {
    return {
        name: db.name || '',
        theme: (db.theme as any) || 'system',
        wakeTime: db.wake_time || defaultPreferences.wakeTime,
        sleepTime: db.sleep_time || defaultPreferences.sleepTime,
        mealTimes: db.meal_times || defaultPreferences.mealTimes,
        snackTimes: db.snack_times || defaultPreferences.snackTimes,
        maxTasksPerBlock: db.max_tasks_per_block || defaultPreferences.maxTasksPerBlock,
        breakDuration: db.break_duration || defaultPreferences.breakDuration,
        movementInterval: db.movement_interval || defaultPreferences.movementInterval,
        workStartTime: db.work_start_time || defaultPreferences.workStartTime,
        workEndTime: db.work_end_time || defaultPreferences.workEndTime,
    };
}

interface ProfileContextType {
    preferences: UserPreferences;
    loading: boolean;
    updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
    refetch: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setPreferences(defaultPreferences);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                const profile: DbProfile = {
                    ...data,
                    theme: (data as any).theme,
                    meal_times: data.meal_times as { breakfast: string; lunch: string; dinner: string } | null,
                };
                setPreferences(mapDbToPreferences(profile));
            }
        } catch (error: any) {
            if (error?.message?.includes('JWT') || error?.code === 'PGRST301') return;
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updatePreferences = async (updates: Partial<UserPreferences>) => {
        if (!user) return;

        const newPreferences = { ...preferences, ...updates };
        setPreferences(newPreferences);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: newPreferences.name,
                    theme: newPreferences.theme,
                    wake_time: newPreferences.wakeTime,
                    sleep_time: newPreferences.sleepTime,
                    meal_times: newPreferences.mealTimes,
                    snack_times: newPreferences.snackTimes,
                    max_tasks_per_block: newPreferences.maxTasksPerBlock,
                    break_duration: newPreferences.breakDuration,
                    movement_interval: newPreferences.movementInterval,
                    work_start_time: newPreferences.workStartTime,
                    work_end_time: newPreferences.workEndTime,
                })
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success('Instellingen opgeslagen');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Kon instellingen niet opslaan');
            // Revert optimization could be added here
        }
    };

    return (
        <ProfileContext.Provider value={{ preferences, loading, updatePreferences, refetch: fetchProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}
