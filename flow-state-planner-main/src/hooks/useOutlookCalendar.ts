import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { TimeBlock } from '@/types';
import { toast } from 'sonner';

interface OutlookCalendarEvent {
    id: string;
    subject: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
}

export function useOutlookCalendar() {
    const { session } = useAuth();
    const [events, setEvents] = useState<TimeBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusLogs, setStatusLogs] = useState<string[]>([]);

    const fetchEvents = useCallback(async () => {
        if (!session?.provider_token) {
            console.log('Outlook Sync skipped: No provider token in session');
            setEvents([]);
            return;
        }

        setLoading(true);
        setError(null);
        const logs: string[] = [];
        setStatusLogs(['Bezig met ophalen van agenda lijst...']);

        try {
            const start = new Date();
            start.setDate(start.getDate() - 3); // 3 days ago
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setDate(end.getDate() + 4); // 4 days ahead (total 7 days)
            end.setHours(23, 59, 59, 999);
            const startStr = start.toISOString();
            const endStr = end.toISOString();

            // 1. Fetch all calendars available to the user
            const calResponse = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
                headers: { Authorization: `Bearer ${session.provider_token}` },
            });

            if (!calResponse.ok) {
                if (calResponse.status === 401) console.warn('Outlook token expired');
                throw new Error('Failed to fetch Outlook calendars');
            }

            const calData = await calResponse.json();
            const calendars = calData.value || [];
            console.log('Outlook: Gevonden agenda\'s:', calendars.map((c: any) => c.name));
            logs.push(`Verbinding gelukt. ${calendars.length} agenda's gevonden.`);

            // 2. Fetch events from EACH calendar
            const allEventsPromises = calendars.map(async (cal: any) => {
                try {
                    const response = await fetch(
                        `https://graph.microsoft.com/v1.0/me/calendars/${cal.id}/calendarview?startDateTime=${startStr}&endDateTime=${endStr}`,
                        {
                            headers: { Authorization: `Bearer ${session.provider_token}` },
                        }
                    );
                    if (!response.ok) {
                        const errText = await response.text();
                        console.error(`Outlook: Fout bij ${cal.name}:`, errText);
                        logs.push(`Fout bij '${cal.name}': ${response.status}`);
                        return [];
                    }
                    const data = await response.json();
                    const count = (data.value || []).length;
                    logs.push(`Agenda '${cal.name}': ${count} items gevonden.`);
                    return data.value || [];
                } catch (e) {
                    console.error(`Error fetching events for calendar ${cal.name}:`, e);
                    logs.push(`Netwerkfout bij '${cal.name}'`);
                    return [];
                }
            });

            const results = await Promise.all(allEventsPromises);
            setStatusLogs(logs);
            const flatEvents = results.flat();

            // 3. Map to TimeBlocks
            const mappedEvents: TimeBlock[] = flatEvents.map((event: OutlookCalendarEvent) => ({
                id: `outlook-${event.id}`,
                startTime: new Date(event.start.dateTime + 'Z'),
                endTime: new Date(event.end.dateTime + 'Z'),
                type: 'task',
                item: {
                    id: `outlook-${event.id}`,
                    title: event.subject || '(Geen titel)',
                    category: 'work',
                    effort: 'medium',
                    importance: 3,
                    completed: false,
                    duration: 0,
                    createdAt: new Date(),
                } as any,
            }));

            // Deduplicate by ID just in case an event appears in multiple lists
            const seen = new Set();
            const uniqueEvents = mappedEvents.filter(e => {
                if (seen.has(e.id)) return false;
                seen.add(e.id);
                return true;
            });

            setEvents(uniqueEvents);
        } catch (err) {
            console.error('Error fetching Outlook Calendar events:', err);
            setError('Kon Outlook Agenda afspraken niet ophalen');
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (session?.provider_token) {
            fetchEvents();
        }
    }, [fetchEvents, session]);

    return { events, loading, error, logs: statusLogs, refetch: fetchEvents };
}
