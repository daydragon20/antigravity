import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskSheet } from "@/components/AddTaskSheet";
import { Button } from "@/components/ui/button";

interface TasksPageProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onEditTask: (task: Task) => void;
}

type FilterType = 'all' | 'active' | 'completed';

export function TasksPage({ tasks, onToggleComplete, onAddTask, onEditTask }: TasksPageProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = tasks.length - completedCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-8 pb-28 px-6"
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Taken</h1>
            <p className="text-muted-foreground">
              {activeCount} actief, {completedCount} voltooid
            </p>
          </div>
          <AddTaskSheet onAdd={onAddTask} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 bg-secondary rounded-xl p-1">
          {[
            { id: 'all' as const, label: 'Alle' },
            { id: 'active' as const, label: 'Actief' },
            { id: 'completed' as const, label: 'Klaar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
                filter === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  {filter === 'completed' ? 'Nog geen voltooide taken' : 
                   filter === 'active' ? 'Alle taken zijn klaar!' : 'Geen taken'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'all' && 'Voeg je eerste taak toe om te beginnen'}
                </p>
              </motion.div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={() => onEditTask(task)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
