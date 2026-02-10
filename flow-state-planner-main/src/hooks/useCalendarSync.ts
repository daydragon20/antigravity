import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, TimeBlock } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCalendarSync(
    googleEvents: TimeBlock[],
    outlookEvents: TimeBlock[],
    existingTasks: Task[],
    onRefresh: () => void,
    isLoading = false,
    googleLogs: string[] = [],
    outlookLogs: string[] = []
) {
    const { user } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    const syncEvents = useCallback(async (manual = false) => {
        if (!user || isSyncing) return;

        setIsSyncing(true);
        const allEvents = [...googleEvents, ...outlookEvents];

        if (allEvents.length === 0) {
            if (manual) {
                if (isLoading) {
                    toast.loading('Agenda items worden opgehaald...');
                } else {
                    toast.info('Geen agenda items gevonden om te synchroniseren');
                }
            }
            setIsSyncing(false);
            return;
        }

        let hasChanges = false;
        let createdCount = 0;
        let updatedCount = 0;

        try {
            console.log(`Starting sync for ${allEvents.length} events...`);
            for (const eventBlock of allEvents) {
                if (!eventBlock.item || eventBlock.type !== 'task') continue;

                const event = eventBlock.item as any;
                const source = googleEvents.includes(eventBlock) ? 'google' : 'outlook';

                const existingTask = existingTasks.find(
                    t => t.externalId === event.id && t.source === source
                );

                // "AI" Refinement logic
                let effort: 'low' | 'medium' | 'high' = 'medium';
                let importance = 3;
                const title = (event.title || '').toLowerCase();

                if (title.includes('meeting') || title.includes('belangrijk') || title.includes('gesprek') || title.includes('call')) {
                    importance = 4;
                    effort = 'high';
                } else if (title.includes('lunch') || title.includes('pauze') || title.includes('koffie') || title.includes('wandelen')) {
                    importance = 2;
                    effort = 'low';
                }

                const taskData = {
                    user_id: user.id,
                    title: event.title,
                    description: event.description || '',
                    category: 'work',
                    effort: effort,
                    importance: importance,
                    scheduled_time: eventBlock.startTime.toISOString(),
                    duration: event.duration || 30,
                    external_id: event.id,
                    source: source,
                    completed: false
                };

                if (!existingTask) {
                    const { error } = await supabase.from('tasks').insert(taskData as any);
                    if (error) {
                        console.error('Error inserting task:', error);
                        // If it's a "column not found" error, we should probably tell the user or at least log it very clearly
                        if (error.code === '42703') throw new Error('Database kolommen ontbreken (external_id of source).');
                        continue;
                    }
                    hasChanges = true;
                    createdCount++;
                } else {
                    const startTimeChanged = existingTask.scheduledTime?.toISOString() !== eventBlock.startTime.toISOString();
                    const titleChanged = existingTask.title !== event.title;

                    if (startTimeChanged || titleChanged) {
                        const { error } = await supabase
                            .from('tasks')
                            .update({
                                title: taskData.title,
                                scheduled_time: taskData.scheduled_time,
                                effort: taskData.effort,
                                importance: taskData.importance
                            } as any)
                            .eq('id', existingTask.id);

                        if (error) {
                            console.error('Error updating task:', error);
                            continue;
                        }
                        hasChanges = true;
                        updatedCount++;
                    }
                }
            }

            if (hasChanges) {
                onRefresh();
            }

            if (manual) {
                const combinedLogs = [...googleLogs, ...outlookLogs];
                const hasErrors = combinedLogs.some(l => l.includes('Fout') || l.includes('Netwerk'));
                const stats = `${createdCount} nieuw, ${updatedCount} bijgewerkt`;

                // Show all "Positive" logs + errors
                const detailedDescription = combinedLogs
                    .filter(l => l.includes('gelukt') || l.includes('gevonden') || l.includes('Fout') || l.includes('Netwerk'))
                    .join('\n');

                if (hasErrors) {
                    toast.error(`Sync voltooid met fouten: ${stats}`, {
                        description: detailedDescription || 'Onbekende fout tijdens synchronisatie.',
                        duration: 6000
                    });
                } else {
                    toast.success(`Gesynchroniseerd: ${stats}`, {
                        description: detailedDescription || 'De agenda is up-to-date.',
                        duration: 5000
                    });
                }
            }
        } catch (error: any) {
            console.error('Sync failed:', error);
            if (manual) toast.error(error.message || 'Synchronisatie mislukt');
        } finally {
            setIsSyncing(false);
        }
    }, [googleEvents, outlookEvents, user, existingTasks, onRefresh, isSyncing, googleLogs, outlookLogs]);

    useEffect(() => {
        // Auto-sync on first load of events
        if (googleEvents.length > 0 || outlookEvents.length > 0) {
            syncEvents();
        }
    }, [googleEvents.length, outlookEvents.length]);

    return {
        sync: () => syncEvents(true),
        isSyncing
    };
}
