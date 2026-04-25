import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, CheckCircle2, Circle, Clock, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, EnergyLevel, TabId } from "@/types";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskSheet } from "@/components/AddTaskSheet";
import { AutoScheduleButton } from "@/components/AutoScheduleButton";

interface TasksPageProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
  onEditTask: (task: Task) => void;
  onNavigate?: (tab: TabId) => void;
}

type FilterType = "today" | "week" | "all";

const categoryColors: Record<string, string> = {
  work: "bg-blue-500",
  health: "bg-emerald-500",
  creative: "bg-violet-500",
  social: "bg-pink-500",
  admin: "bg-amber-500",
  other: "bg-slate-400",
};

const categoryEmoji: Record<string, string> = {
  work: "💼", health: "🏃", creative: "🎨", social: "👥", admin: "📋", other: "📌",
};

export function TasksPage({ tasks, onToggleComplete, onAddTask, onEditTask, onNavigate }: TasksPageProps) {
  const [filter, setFilter] = useState<FilterType>("today");
  const [addOpen, setAddOpen] = useState(false);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filtered = tasks.filter((t) => {
    if (filter === "today") {
      if (t.completed) return false;
      if (!t.deadline && !t.scheduledTime) return true;
      const date = t.scheduledTime || t.deadline;
      return date ? date < endOfWeek : true;
    }
    if (filter === "week") {
      if (t.completed) return false;
      const date = t.scheduledTime || t.deadline;
      return date ? date >= startOfToday && date < endOfWeek : true;
    }
    return true;
  });

  const active = filtered.filter((t) => !t.completed);
  const done = filtered.filter((t) => t.completed);

  const highFocus = active.filter((t) => t.effort === "high" || t.importance >= 4);
  const lowFocus = active.filter((t) => t.effort !== "high" && t.importance < 4);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-5 pt-14 pb-4 border-b border-border/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-foreground">Taken</h1>
            <div className="flex items-center gap-2">
              <AutoScheduleButton tasks={tasks} onScheduled={() => {}} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {completedCount} voltooid · {tasks.length - completedCount} actief
          </p>
        </div>
      </header>

      {/* Filter pills */}
      <div className="px-5 pt-4 max-w-lg mx-auto">
        <div className="inline-flex bg-secondary rounded-xl p-1 gap-1">
          {(["today", "week", "all"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "today" ? "Vandaag" : f === "week" ? "Deze week" : "Alles"}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <main className="px-5 pt-5 max-w-lg mx-auto space-y-6">
        {active.length === 0 && done.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-foreground">Alles gedaan! 🎉</h3>
            <p className="text-sm text-muted-foreground mt-1">Voeg nieuwe taken toe of ontspan even.</p>
          </motion.div>
        ) : (
          <>
            {/* High-focus group */}
            {highFocus.length > 0 && (
              <TaskGroup
                label="🔥 Hoge focus"
                sublabel="Taken die jouw volle aandacht vragen"
                tasks={highFocus}
                onToggle={onToggleComplete}
                onEdit={onEditTask}
                categoryColors={categoryColors}
                categoryEmoji={categoryEmoji}
              />
            )}

            {/* Low-focus group */}
            {lowFocus.length > 0 && (
              <TaskGroup
                label="⚡ Lage inspanning"
                sublabel="Snel af te handelen"
                tasks={lowFocus}
                onToggle={onToggleComplete}
                onEdit={onEditTask}
                categoryColors={categoryColors}
                categoryEmoji={categoryEmoji}
              />
            )}

            {/* Completed group */}
            {done.length > 0 && (
              <TaskGroup
                label="✅ Voltooid"
                sublabel={`${done.length} taken afgerond`}
                tasks={done}
                onToggle={onToggleComplete}
                onEdit={onEditTask}
                categoryColors={categoryColors}
                categoryEmoji={categoryEmoji}
                collapsed
              />
            )}
          </>
        )}
      </main>

      {/* Floating Add */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <AddTaskSheet open={addOpen} onOpenChange={setAddOpen} onAdd={onAddTask} />
    </div>
  );
}

function TaskGroup({
  label,
  sublabel,
  tasks,
  onToggle,
  onEdit,
  categoryColors,
  categoryEmoji,
  collapsed = false,
}: {
  label: string;
  sublabel: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (t: Task) => void;
  categoryColors: Record<string, string>;
  categoryEmoji: Record<string, string>;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(!collapsed);

  return (
    <section>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="text-left">
          <h2 className="text-sm font-semibold text-foreground">{label}</h2>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
        <span className={cn("text-xs text-muted-foreground transition-transform", open ? "rotate-180" : "")}>
          ▾
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {tasks.map((task) => (
              <SwipeableTaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                categoryColors={categoryColors}
                categoryEmoji={categoryEmoji}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SwipeableTaskCard({
  task,
  onToggle,
  onEdit,
  categoryColors,
  categoryEmoji,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (t: Task) => void;
  categoryColors: Record<string, string>;
  categoryEmoji: Record<string, string>;
}) {
  const cat = task.category || "other";
  const barColor = categoryColors[cat] || "bg-slate-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) onToggle(task.id);
      }}
      className={cn("rounded-2xl border border-border bg-card shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform", task.completed && "opacity-50")}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-stretch">
        {/* Category colour bar */}
        <div className={cn("w-1 flex-shrink-0", barColor)} />

        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
              className="mt-0.5 flex-shrink-0"
            >
              {task.completed
                ? <CheckCircle2 className="w-5 h-5 text-primary" />
                : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />}
            </button>

            <div className="flex-1 min-w-0">
              <p className={cn("font-medium text-foreground text-sm leading-snug", task.completed && "line-through text-muted-foreground")}>
                {categoryEmoji[cat]} {task.title}
              </p>

              <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {task.duration}m
                </span>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", {
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400": task.effort === "low",
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400": task.effort === "medium",
                  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400": task.effort === "high",
                })}>
                  {task.effort === "low" ? "Makkelijk" : task.effort === "medium" ? "Gemiddeld" : "Intensief"}
                </span>
                {task.scheduledTime && (
                  <span className="text-xs text-primary font-medium ml-auto">
                    {task.scheduledTime.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {task.recurrenceRule && (
                  <span className="text-xs text-indigo-500">🔁 {task.recurrenceRule === "daily" ? "Dagelijks" : task.recurrenceRule === "weekly" ? "Wekelijks" : "Maandelijks"}</span>
                )}
              </div>
            </div>

            {/* Importance dots */}
            <div className="flex flex-col gap-0.5 items-center mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < task.importance ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
