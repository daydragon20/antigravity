import type { Task, EnergyLog, Habit, HabitLog } from '@/types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export function exportTasksCSV(tasks: Task[]): string {
  const header = ['Titel', 'Beschrijving', 'Categorie', 'Inspanning', 'Belang', 'Duur (min)', 'Deadline', 'Ingepland', 'Voltooid', 'Aangemaakt'];
  const rows = tasks.map((t) => [
    `"${t.title.replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category || 'other',
    t.effort,
    t.importance,
    t.duration,
    t.deadline ? format(t.deadline, 'dd-MM-yyyy', { locale: nl }) : '',
    t.scheduledTime ? format(t.scheduledTime, 'dd-MM-yyyy HH:mm', { locale: nl }) : '',
    t.completed ? 'Ja' : 'Nee',
    format(t.createdAt, 'dd-MM-yyyy', { locale: nl }),
  ]);

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportEnergyLogsCSV(logs: EnergyLog[]): string {
  const header = ['Datum', 'Tijd', 'Energie', 'Stemming', 'Notities'];
  const rows = logs.map((l) => [
    format(l.timestamp, 'dd-MM-yyyy', { locale: nl }),
    format(l.timestamp, 'HH:mm'),
    l.energy,
    l.mood,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportDataJSON(
  tasks: Task[],
  energyLogs: EnergyLog[],
  habits?: Habit[],
  habitLogs?: HabitLog[]
): string {
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      version: '1.0',
      tasks,
      energyLogs,
      habits: habits || [],
      habitLogs: habitLogs || [],
    },
    null,
    2
  );
}

export function exportTasksICS(tasks: Task[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flow State//FlowState App//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  tasks
    .filter((t) => t.scheduledTime)
    .forEach((task) => {
      const start = task.scheduledTime!;
      const end = new Date(start.getTime() + task.duration * 60 * 1000);
      const created = task.createdAt;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${task.id}@flowstate.app`,
        `DTSTAMP:${formatICSDate(created)}`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${escapeProp(task.title)}`,
        task.description ? `DESCRIPTION:${escapeProp(task.description)}` : '',
        `CATEGORIES:${(task.category || 'other').toUpperCase()}`,
        'END:VEVENT'
      );
    });

  lines.push('END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeProp(str: string): string {
  return str.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
