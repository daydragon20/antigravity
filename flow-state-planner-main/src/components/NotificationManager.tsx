import { useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTasks } from '@/hooks/useTasks';
import { useProfile } from '@/hooks/useProfile';
import { useHealthReminders } from '@/hooks/useHealthReminders';

export function NotificationManager() {
    const { settings, sendNotification, permission } = useNotifications();
    const { tasks } = useTasks();
    const { preferences } = useProfile();
    const { reminders } = useHealthReminders();

    const lastCheckMinute = useRef<string>('');

    useEffect(() => {
        if (permission !== 'granted' || !settings.enabled) return;

        const checkNotifications = () => {
            const now = new Date();
            const currentMinuteKey = `${now.getHours()}:${now.getMinutes()}`;

            // Prevent multiple checks in the same minute
            if (lastCheckMinute.current === currentMinuteKey) return;
            lastCheckMinute.current = currentMinuteKey;

            const currentTimeString = now.toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // 1. Check Meal Times
            if (settings.mealReminders) {
                if (currentTimeString === preferences.mealTimes.breakfast) {
                    sendNotification('Tijd voor ontbijt 🍳', 'Begin je dag goed met een gezond ontbijt!');
                }
                if (currentTimeString === preferences.mealTimes.lunch) {
                    sendNotification('Lunchtijd 🥗', 'Neem even pauze voor een voedzame lunch.');
                }
                if (currentTimeString === preferences.mealTimes.dinner) {
                    sendNotification('Diner tijd 🍽️', 'Eet smakelijk! Geniet van je avondeten.');
                }

                // Snack times
                if (preferences.snackTimes.includes(currentTimeString)) {
                    sendNotification('Tijd voor een snack 🍎', 'Neem een gezond tussendoortje om je energie op peil te houden.');
                }
            }

            // 2. Check Tasks
            if (settings.taskReminders) {
                tasks.forEach(task => {
                    if (!task.completed && task.scheduledTime) {
                        const taskTime = new Date(task.scheduledTime).toLocaleTimeString('nl-NL', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        if (taskTime === currentTimeString) {
                            sendNotification('Taak herinnering 📋', `Tijd om te beginnen aan: ${task.title}`);
                        }
                    }
                });
            }

            // 3. Health Reminders
            if (settings.movementReminders) {
                reminders.forEach(reminder => {
                    if (!reminder.completed && reminder.type === 'movement') {
                        const reminderTime = new Date(reminder.scheduledTime).toLocaleTimeString('nl-NL', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        if (reminderTime === currentTimeString) {
                            sendNotification('Beweging 🏃', 'Tijd om even te bewegen!');
                        }
                    }
                });
            }

            // 4. Energy Check-ins
            if (settings.energyCheckIns) {
                const checkInTimes = ['09:00', '13:00', '17:00', '21:00'];
                if (checkInTimes.includes(currentTimeString)) {
                    sendNotification('Energy Check-in ⚡', 'Hoe voel je je nu? Log je energie in de app.');
                }
            }
        };

        // Check every 10 seconds to catch the minute change accurately
        const intervalId = setInterval(checkNotifications, 10000);

        // Initial check
        checkNotifications();

        return () => clearInterval(intervalId);
    }, [settings, permission, tasks, preferences, reminders, sendNotification]);

    return null; // This component doesn't render anything
}
