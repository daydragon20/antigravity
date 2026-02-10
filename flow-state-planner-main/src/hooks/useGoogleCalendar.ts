import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { TimeBlock } from '@/types';
import { toast } from 'sonner';

interface GoogleCalendarEvent {
    id: string;
    summary: string;
    start: { dateTime: string; date?: string };
    end: { dateTime: string; date?: string };
}

export function useGoogleCalendar() {
    const { session } = useAuth();
    const [events, setEvents] = useState<TimeBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusLogs, setStatusLogs] = useState<string[]>([]);

    const fetchEvents = useCallback(async () => {
        if (!session?.provider_token) {
            console.log('Google Sync skipped: No provider token in session');
            setEvents([]);
            return;
        }

        setLoading(true);
        setError(null);
        const logs: string[] = [];
        setStatusLogs(['Bezig met ophalen van Google agenda lijst...']);

        try {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - 3); // 3 days ago
            startTime.setHours(0, 0, 0, 0);
            const endTime = new Date();
            endTime.setDate(endTime.getDate() + 4); // 4 days ahead
            endTime.setHours(23, 59, 59, 999);
            const timeMin = startTime.toISOString();
            const timeMax = endTime.toISOString();

            // 1. Fetch the list of all calendars the user has access to
            const listResponse = await fetch(
                `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
                {
                    headers: { Authorization: `Bearer ${session.provider_token}` },
                }
            );

            if (!listResponse.ok) {
                throw new Error('Failed to fetch Google calendar list');
            }

            const listData = await listResponse.json();
            const calendars = listData.items || [];
            console.log('Google: Gevonden agenda\'s:', calendars.map((c: any) => c.summary));
            logs.push(`Verbinding gelukt. ${calendars.length} Google agenda's gevonden.`);

            // 2. Fetch events from EACH calendar
            const allEventsPromises = calendars.map(async (cal: any) => {
                try {
                    const response = await fetch(
                        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
                        {
                            headers: { Authorization: `Bearer ${session.provider_token}` },
                        }
                    );
                    if (!response.ok) {
                        const errText = await response.text();
                        console.error(`Google: Fout bij ${cal.summary}:`, errText);
                        logs.push(`Fout bij '${cal.summary}': ${response.status}`);
                        return [];
                    }
                    const data = await response.json();
                    const count = (data.items || []).length;
                    logs.push(`Agenda '${cal.summary}': ${count} items gevonden.`);
                    return data.items || [];
                } catch (e) {
                    console.error(`Error fetching events for Google calendar ${cal.summary}:`, e);
                    logs.push(`Netwerkfout bij '${cal.summary}'`);
                    return [];
                }
            });

            const results = await Promise.all(allEventsPromises);
            setStatusLogs(logs);
            const flatEvents = results.flat();

            // 3. Map to TimeBlocks
            const mappedEvents: TimeBlock[] = flatEvents.map((event: GoogleCalendarEvent) => ({
                id: `gcal-${event.id}`,
                startTime: new Date(event.start.dateTime || event.start.date!),
                endTime: new Date(event.end.dateTime || event.end.date!),
                type: 'task',
                item: {
                    id: `gcal-${event.id}`,
                    title: event.summary || '(Geen titel)',
                    category: 'work',
                    effort: 'medium',
                    importance: 3,
                    completed: false,
                    duration: 0,
                    createdAt: new Date(),
                } as any,
            }));

            // Deduplicate by ID
            const seen = new Set();
            const uniqueEvents = mappedEvents.filter(e => {
                if (seen.has(e.id)) return false;
                seen.add(e.id);
                return true;
            });

            setEvents(uniqueEvents);
        } catch (err) {
            console.error('Error fetching Google Calendar events:', err);
            setError('Kon Google Agenda afspraken niet ophalen');
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
