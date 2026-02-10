import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTasks } from '@/hooks/useTasks';
import { useHealthReminders } from '@/hooks/useHealthReminders';
import { useProfile } from '@/hooks/useProfile';

export function NotificationController() {
    const { settings, sendNotification, permission } = useNotifications();
    const { tasks } = useTasks();
    const { reminders } = useHealthReminders();
    const { preferences } = useProfile();

    // Check for upcoming tasks and reminders every minute
    useEffect(() => {
        if (!settings.enabled || permission !== 'granted') return;

        const checkSchedule = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Task Reminders (15 minutes before)
            if (settings.taskReminders) {
                tasks.forEach(task => {
                    if (!task.completed && task.scheduledTime) {
                        const taskTime = new Date(task.scheduledTime);
                        const timeDiff = taskTime.getTime() - now.getTime();
                        const minutesDiff = Math.floor(timeDiff / 1000 / 60);

                        if (minutesDiff === 15) {
                            sendNotification(
                                'Taak start bijna',
                                `"${task.title}" begint over 15 minuten.`,
                                { tag: `task-${task.id}` }
                            );
                        }
                    }
                });
            }

            // Health Reminders
            if (settings.mealReminders || settings.movementReminders || settings.restReminders) {
                reminders.forEach(reminder => {
                    if (!reminder.completed) {
                        const reminderTime = new Date(reminder.scheduledTime);
                        if (
                            reminderTime.getHours() === currentHour &&
                            reminderTime.getMinutes() === currentMinute
                        ) {
                            const shouldNotify =
                                (reminder.type === 'meal' && settings.mealReminders) ||
                                (reminder.type === 'movement' && settings.movementReminders) ||
                                (reminder.type === 'rest' && settings.restReminders);

                            if (shouldNotify) {
                                sendNotification(
                                    reminder.title,
                                    'Tijd voor je geplande activiteit!',
                                    { tag: `reminder-${reminder.id}` }
                                );
                            }
                        }
                    }
                });
            }

            // Energy Check-ins (Periodic)
            // Example logic: every 4 hours during work time
            if (settings.energyCheckIns) {
                // Simple check-in logic could be added here
            }
        };

        const interval = setInterval(checkSchedule, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [tasks, reminders, settings, permission, sendNotification]);

    return null;
}
