import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Zap, CheckCircle2, ChevronRight, Flame, Brain, Timer, Settings, BarChart2, Heart } from "lucide-react";
import { AuthPage } from "@/components/AuthPage";
import { BottomNav } from "@/components/BottomNav";
import { SettingsPage } from "@/components/SettingsPage";
import { TasksPage } from "@/components/TasksPage";
import { EnergieCoachPage } from "@/components/EnergieCoachPage";
import { BrainDumpPage } from "@/components/BrainDumpPage";
import { FocusTimerPage } from "@/components/FocusTimerPage";
import { HabitsPage } from "@/components/HabitsPage";
import { InsightsPage } from "@/components/InsightsPage";
import { EnergyPage } from "@/components/EnergyPage";
import { EditTaskSheet } from "@/components/EditTaskSheet";
import { AddTaskSheet } from "@/components/AddTaskSheet";
import { EnergyTracker } from "@/components/EnergyTracker";
import { TaskCard } from "@/components/TaskCard";
import { DailyTimeline } from "@/components/DailyTimeline";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useTasks } from "@/hooks/useTasks";
import { useEnergyLogs } from "@/hooks/useEnergyLogs";
import { useHealthReminders } from "@/hooks/useHealthReminders";
import { useHabits } from "@/hooks/useHabits";
import type { Task, EnergyLevel, MoodLevel, TabId, TimeBlock } from "@/types";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Slaap lekker";
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

function getEnergyLabel(level: EnergyLevel): string {
  const labels: Record<EnergyLevel, string> = {
    1: "Uitgeput", 2: "Laag", 3: "Gemiddeld", 4: "Goed", 5: "Top"
  };
  return labels[level];
}

function getEnergyGradient(level: EnergyLevel): string {
  const gradients: Record<EnergyLevel, string> = {
    1: "from-slate-400 to-slate-500",
    2: "from-blue-400 to-blue-500",
    3: "from-yellow-400 to-orange-400",
    4: "from-emerald-400 to-teal-400",
    5: "from-violet-500 to-indigo-500",
  };
  return gradients[level];
}

function getEnergyEmoji(level: EnergyLevel): string {
  return ["🪫", "😴", "😐", "😊", "🚀"][level - 1];
}

const sampleTimeBlocks: TimeBlock[] = [
  { id: "b1", startTime: new Date(new Date().setHours(8, 0)), endTime: new Date(new Date().setHours(8, 30)), type: "meal" },
  { id: "b2", startTime: new Date(new Date().setHours(9, 0)), endTime: new Date(new Date().setHours(10, 0)), type: "task" },
  { id: "b3", startTime: new Date(new Date().setHours(10, 30)), endTime: new Date(new Date().setHours(11, 0)), type: "task" },
  { id: "b4", startTime: new Date(new Date().setHours(11, 0)), endTime: new Date(new Date().setHours(11, 15)), type: "movement" },
  { id: "b5", startTime: new Date(new Date().setHours(12, 30)), endTime: new Date(new Date().setHours(13, 0)), type: "meal" },
  { id: "b6", startTime: new Date(new Date().setHours(14, 0)), endTime: new Date(new Date().setHours(14, 45)), type: "task" },
  { id: "b7", startTime: new Date(new Date().setHours(15, 30)), endTime: new Date(new Date().setHours(15, 40)), type: "rest" },
];

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, addTasksBatch, updateTask, deleteTask, toggleTaskComplete } = useTasks();
  const { energyLogs, addLog, getLatestLog } = useEnergyLogs();
  const { preferences, updatePreferences } = useProfile();
  const { reminders, toggleReminderComplete } = useHealthReminders();
  const { habits, isLoggedToday, logHabit, getStreak } = useHabits();

  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showEnergyTracker, setShowEnergyTracker] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const latestLog = getLatestLog();
  const currentEnergy: EnergyLevel = latestLog?.energy ?? 3;
  const currentMood: MoodLevel = latestLog?.mood ?? 3;

  const handleEnergySubmit = async (energy: EnergyLevel, mood: MoodLevel) => {
    await addLog(energy, mood);
    setShowEnergyTracker(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 animate-pulse" />
          <p className="text-sm text-muted-foreground">Flow State laden...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const navigateTo = (tab: TabId) => setActiveTab(tab);

  if (activeTab === 'settings') return (
    <PageWrapper>
      <SettingsPage preferences={preferences} onUpdatePreferences={updatePreferences} onSignOut={signOut} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </PageWrapper>
  );

  if (activeTab === 'tasks') return (
    <PageWrapper>
      <TasksPage tasks={tasks} onToggleComplete={toggleTaskComplete} onAddTask={addTask} onEditTask={setEditingTask} onNavigate={navigateTo} />
      <EditTaskSheet task={editingTask} open={!!editingTask} onOpenChange={(o) => !o && setEditingTask(null)} onSave={updateTask} onDelete={deleteTask} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </PageWrapper>
  );

  if (activeTab === 'coach') return (
    <PageWrapper>
      <EnergieCoachPage onNavigate={navigateTo} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </PageWrapper>
  );

  if (activeTab === 'braindump') return (
    <PageWrapper>
      <BrainDumpPage onTasksAdded={addTasksBatch} onNavigate={navigateTo} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </PageWrapper>
  );

  if (activeTab === 'focus') return (
    <PageWrapper>
      <FocusTimerPage tasks={tasks} onTaskComplete={toggleTaskComplete} onNavigate={navigateTo} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </PageWrapper>
  );

  if (activeTab === 'habits') return (
    <PageWrapper>
      <HabitsPage onNavigate={navigateTo} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </PageWrapper>
  );

  if (activeTab === 'energy') return (
    <PageWrapper>
      <EnergyPage currentEnergy={currentEnergy} currentMood={currentMood} energyLogs={energyLogs} onLogEnergy={handleEnergySubmit} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </PageWrapper>
  );

  if (activeTab === 'insights') return (
    <PageWrapper>
      <InsightsPage tasks={tasks} energyLogs={energyLogs} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </PageWrapper>
  );

  // ── HOME DASHBOARD ──────────────────────────────────────
  const today = new Date();
  const dateStr = today.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  const userName = preferences.name?.split(' ')[0] || '';
  const completedToday = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const focusTask = pendingTasks.find((t) => t.effort === 'high' && t.importance >= 4) || pendingTasks[0];
  const todayHabits = habits.filter((h) => isLoggedToday(h.id)).length;

  return (
    <div className="min-h-screen bg-background pb-28 overflow-x-hidden">
      {/* ── TOP HEADER ── */}
      <header className="px-5 pt-14 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground capitalize">{dateStr}</p>
              <h1 className="text-2xl font-bold text-foreground mt-0.5">
                {getGreeting()}{userName ? `, ${userName}` : ''} {currentEnergy >= 4 ? '✨' : '👋'}
              </h1>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <Settings className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 max-w-lg mx-auto space-y-6">
        {/* ── ENERGY CHECK-IN CARD ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {showEnergyTracker ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
              <EnergyTracker onSubmit={handleEnergySubmit} currentEnergy={currentEnergy} currentMood={currentMood} />
            </motion.div>
          ) : (
            <button
              onClick={() => setShowEnergyTracker(true)}
              className={cn(
                "w-full rounded-2xl p-5 text-white bg-gradient-to-r shadow-lg active:scale-[0.98] transition-transform text-left",
                getEnergyGradient(currentEnergy)
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Energie nu</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-bold">{getEnergyEmoji(currentEnergy)}</span>
                    <span className="text-xl font-semibold">{getEnergyLabel(currentEnergy)}</span>
                  </div>
                  <p className="text-white/60 text-xs mt-1">Tik om bij te werken</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white/20 rounded-xl px-3 py-1.5 text-sm font-semibold">
                    {currentEnergy}/5
                  </div>
                  <div className="text-xs text-white/60">{totalTasks > 0 ? `${completedToday}/${totalTasks} klaar` : 'Geen taken'}</div>
                </div>
              </div>
            </button>
          )}
        </motion.div>

        {/* ── QUICK STATS ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <QuickStatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            value={`${completedToday}/${totalTasks}`}
            label="Taken"
            color="text-emerald-500"
            onClick={() => setActiveTab('tasks')}
          />
          <QuickStatCard
            icon={<Flame className="w-4 h-4" />}
            value={`${todayHabits}/${habits.length || 0}`}
            label="Gewoonten"
            color="text-orange-500"
            onClick={() => setActiveTab('habits')}
          />
          <QuickStatCard
            icon={<Heart className="w-4 h-4" />}
            value={reminders.filter((r) => r.completed).length + '/' + reminders.length}
            label="Reminders"
            color="text-rose-500"
            onClick={() => setActiveTab('energy')}
          />
        </motion.div>

        {/* ── FOCUS NOW CARD ── */}
        {focusTask && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Focus nu op</span>
                </div>
                <button
                  onClick={() => setActiveTab('focus')}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Timer className="w-3.5 h-3.5" />
                  Start timer
                </button>
              </div>
              <div className="px-4 pb-4">
                <h3 className="font-semibold text-foreground text-base">{focusTask.title}</h3>
                {focusTask.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{focusTask.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-lg", {
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400": focusTask.effort === 'low',
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400": focusTask.effort === 'medium',
                    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400": focusTask.effort === 'high',
                  })}>
                    {focusTask.effort === 'low' ? 'Makkelijk' : focusTask.effort === 'medium' ? 'Gemiddeld' : 'Intensief'}
                  </span>
                  <span className="text-xs text-muted-foreground">{focusTask.duration} min</span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < focusTask.importance ? "bg-primary" : "bg-muted")} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DAILY TIMELINE ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionHeader title="Dagplanning" action={{ label: "Alles", onClick: () => setActiveTab('tasks') }} />
          <div className="rounded-2xl border border-border bg-card shadow-sm p-4">
            <DailyTimeline blocks={sampleTimeBlocks} />
          </div>
        </motion.div>

        {/* ── UPCOMING TASKS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionHeader
            title="Komende taken"
            action={{ label: "Alles zien", onClick: () => setActiveTab('tasks') }}
          />
          <div className="space-y-2">
            {tasksLoading ? (
              <LoadingSkeleton />
            ) : pendingTasks.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                title="Alles klaar!"
                subtitle="Voeg een nieuwe taak toe"
                action={{ label: "Taak toevoegen", onClick: () => setShowAddTask(true) }}
              />
            ) : (
              pendingTasks.slice(0, 3).map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                  <TaskCard task={task} onToggleComplete={toggleTaskComplete} onEdit={() => setEditingTask(task)} />
                </motion.div>
              ))
            )}
            {pendingTasks.length > 3 && (
              <button onClick={() => setActiveTab('tasks')} className="w-full py-2.5 text-sm text-primary font-medium hover:underline">
                +{pendingTasks.length - 3} meer taken →
              </button>
            )}
          </div>
        </motion.div>

        {/* ── QUICK ACTIONS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader title="Snelle acties" />
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={<Brain className="w-5 h-5" />}
              title="Brain Dump"
              subtitle="Alles kwijt in je hoofd"
              color="from-violet-500/20 to-purple-500/10"
              iconColor="text-violet-600 dark:text-violet-400"
              onClick={() => setActiveTab('braindump')}
            />
            <QuickActionCard
              icon={<Timer className="w-5 h-5" />}
              title="Focus Timer"
              subtitle="Pomodoro starten"
              color="from-orange-500/20 to-amber-500/10"
              iconColor="text-orange-600 dark:text-orange-400"
              onClick={() => setActiveTab('focus')}
            />
            <QuickActionCard
              icon={<BarChart2 className="w-5 h-5" />}
              title="Inzichten"
              subtitle="Patronen & statistieken"
              color="from-blue-500/20 to-cyan-500/10"
              iconColor="text-blue-600 dark:text-blue-400"
              onClick={() => setActiveTab('insights')}
            />
            <QuickActionCard
              icon={<Zap className="w-5 h-5" />}
              title="Energie loggen"
              subtitle="Hoe voel je je?"
              color="from-emerald-500/20 to-teal-500/10"
              iconColor="text-emerald-600 dark:text-emerald-400"
              onClick={() => setShowEnergyTracker(true)}
            />
          </div>
        </motion.div>
      </main>

      {/* ── FLOATING ADD BUTTON ── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      {/* ── SHEETS & MODALS ── */}
      <AddTaskSheet open={showAddTask} onOpenChange={setShowAddTask} onAdd={addTask} />
      <EditTaskSheet task={editingTask} open={!!editingTask} onOpenChange={(o) => !o && setEditingTask(null)} onSave={updateTask} onDelete={deleteTask} />
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabId)} />
    </div>
  );
};

// ── SUB-COMPONENTS ──

function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {action && (
        <button onClick={action.onClick} className="flex items-center gap-0.5 text-sm text-primary font-medium hover:underline">
          {action.label} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function QuickStatCard({ icon, value, label, color, onClick }: { icon: React.ReactNode; value: string; label: string; color: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm hover:shadow-md active:scale-[0.97] transition-all"
    >
      <div className={cn("flex justify-center mb-2", color)}>{icon}</div>
      <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </button>
  );
}

function QuickActionCard({ icon, title, subtitle, color, iconColor, onClick }: { icon: React.ReactNode; title: string; subtitle: string; color: string; iconColor: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("rounded-2xl bg-gradient-to-br p-4 text-left active:scale-[0.97] transition-transform border border-border/50 shadow-sm hover:shadow-md", color)}
    >
      <div className={cn("mb-3", iconColor)}>{icon}</div>
      <p className="font-semibold text-sm text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </button>
  );
}

function EmptyState({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-3 text-sm text-primary font-medium hover:underline">
          {action.label}
        </button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
          <div className="h-4 bg-muted rounded-lg w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded-lg w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default Index;
