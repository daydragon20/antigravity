import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { EnergyIndicator } from "@/components/EnergyIndicator";
import { MoodIndicator } from "@/components/MoodIndicator";
import { TaskCard } from "@/components/TaskCard";
import { HealthReminderCard } from "@/components/HealthReminderCard";
import { EnergyTracker } from "@/components/EnergyTracker";
import { DailyTimeline } from "@/components/DailyTimeline";
import { AddTaskSheet } from "@/components/AddTaskSheet";
import { BottomNav } from "@/components/BottomNav";
import { SettingsPage } from "@/components/SettingsPage";
import { TasksPage } from "@/components/TasksPage";
import { EnergyPage } from "@/components/EnergyPage";
import { EnergieCoachPage } from "@/components/EnergieCoachPage";
import { InsightsPage } from "@/components/InsightsPage";
import { EditTaskSheet } from "@/components/EditTaskSheet";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useEnergyLogs } from "@/hooks/useEnergyLogs";
import { useProfile } from "@/hooks/useProfile";
import { useHealthReminders } from "@/hooks/useHealthReminders";
import type { Task, TimeBlock, EnergyLevel, MoodLevel, TabId } from "@/types";

// Sample time blocks for demo (will be generated from actual data later)
const sampleTimeBlocks: TimeBlock[] = [
  { id: "b1", startTime: new Date(new Date().setHours(8, 0)), endTime: new Date(new Date().setHours(8, 30)), type: "meal" },
  { id: "b2", startTime: new Date(new Date().setHours(9, 0)), endTime: new Date(new Date().setHours(10, 0)), type: "task" },
  { id: "b3", startTime: new Date(new Date().setHours(10, 30)), endTime: new Date(new Date().setHours(11, 0)), type: "task" },
  { id: "b4", startTime: new Date(new Date().setHours(11, 0)), endTime: new Date(new Date().setHours(11, 15)), type: "movement" },
  { id: "b5", startTime: new Date(new Date().setHours(12, 30)), endTime: new Date(new Date().setHours(13, 0)), type: "meal" },
  { id: "b6", startTime: new Date(new Date().setHours(14, 0)), endTime: new Date(new Date().setHours(14, 45)), type: "task" },
  { id: "b7", startTime: new Date(new Date().setHours(15, 30)), endTime: new Date(new Date().setHours(15, 40)), type: "rest" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, toggleTaskComplete } = useTasks();
  const { energyLogs, addLog, getLatestLog } = useEnergyLogs();
  const { preferences, updatePreferences } = useProfile();
  const { reminders, toggleReminderComplete } = useHealthReminders();
  
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showEnergyTracker, setShowEnergyTracker] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Get current energy and mood from latest log
  const latestLog = getLatestLog();
  const currentEnergy: EnergyLevel = latestLog?.energy ?? 4;
  const currentMood: MoodLevel = latestLog?.mood ?? 4;

  const handleEnergySubmit = async (energy: EnergyLevel, mood: MoodLevel) => {
    await addLog(energy, mood);
    setShowEnergyTracker(false);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Render different pages based on active tab
  if (activeTab === 'settings') {
    return (
      <>
        <SettingsPage 
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          onSignOut={signOut}
        />
        <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
      </>
    );
  }

  if (activeTab === 'tasks') {
    return (
      <>
        <TasksPage
          tasks={tasks}
          onToggleComplete={toggleTaskComplete}
          onAddTask={addTask}
          onEditTask={(task) => setEditingTask(task)}
        />
        <EditTaskSheet
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSave={updateTask}
          onDelete={deleteTask}
        />
        <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
      </>
    );
  }

  if (activeTab === 'energy') {
    return (
      <>
        <EnergyPage
          currentEnergy={currentEnergy}
          currentMood={currentMood}
          energyLogs={energyLogs}
          onLogEnergy={handleEnergySubmit}
        />
        <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
      </>
    );
  }

  if (activeTab === 'coach') {
    return (
      <>
        <EnergieCoachPage />
        <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
      </>
    );
  }

  if (activeTab === 'insights') {
    return (
      <>
        <InsightsPage
          tasks={tasks}
          energyLogs={energyLogs}
        />
        <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
      </>
    );
  }

  const today = new Date();
  const dateString = today.toLocaleDateString('nl-NL', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const userName = preferences.name || '';

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="gradient-hero pt-12 pb-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {getGreeting()}{userName ? `, ${userName}` : ''} 👋
              </h1>
              <p className="text-muted-foreground capitalize">{dateString}</p>
            </div>
            <div className="flex items-center gap-2 bg-card rounded-xl p-3 shadow-card">
              <EnergyIndicator level={currentEnergy} size="sm" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center shadow-card">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-xl font-bold text-foreground">{completedTasks}/{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Taken klaar</p>
            </Card>
            <Card 
              className="p-4 text-center shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
              onClick={() => setShowEnergyTracker(true)}
            >
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-accent" />
              <div className="flex justify-center">
                <EnergyIndicator level={currentEnergy} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Energie</p>
            </Card>
            <Card 
              className="p-4 text-center shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
              onClick={() => setShowEnergyTracker(true)}
            >
              <MoodIndicator level={currentMood} size="sm" />
              <p className="text-xs text-muted-foreground mt-1">Stemming</p>
            </Card>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="px-6 -mt-4 max-w-lg mx-auto">
        {/* Energy Tracker Modal */}
        <AnimatePresence>
          {showEnergyTracker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <EnergyTracker 
                onSubmit={handleEnergySubmit}
                currentEnergy={currentEnergy}
                currentMood={currentMood}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Dagplanning</h2>
            <button 
              className="flex items-center gap-1 text-sm text-primary font-medium"
              onClick={() => setActiveTab('tasks')}
            >
              Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Card className="p-5 shadow-card">
            <DailyTimeline blocks={sampleTimeBlocks} />
          </Card>
        </motion.section>

        {/* AI Insight */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="p-5 gradient-energy text-white shadow-elevated">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Inzicht</h3>
                <p className="text-sm text-white/90">
                  {currentEnergy >= 4 
                    ? `Je energie is momenteel hoog! Dit is een goed moment voor je belangrijkste taak${tasks.find(t => !t.completed && t.effort === 'high') ? `: "${tasks.find(t => !t.completed && t.effort === 'high')?.title}"` : ''}.`
                    : currentEnergy >= 3
                    ? "Je energie is gemiddeld. Focus op taken met gemiddelde inspanning en plan een korte pauze."
                    : "Je energie is laag. Overweeg een pauze, wat beweging of een snack."}
                </p>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Health Reminders */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Gezondheidsherinneringen</h2>
          </div>
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground">
                Geen herinneringen voor vandaag
              </Card>
            ) : (
              reminders.slice(0, 3).map((reminder) => (
                <HealthReminderCard 
                  key={reminder.id} 
                  reminder={reminder}
                  onToggleComplete={toggleReminderComplete}
                />
              ))
            )}
          </div>
        </motion.section>

        {/* Tasks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Taken vandaag</h2>
            <AddTaskSheet onAdd={addTask} />
          </div>
          <div className="space-y-3">
            {tasksLoading ? (
              <Card className="p-4 text-center text-muted-foreground">
                Laden...
              </Card>
            ) : tasks.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground">
                Nog geen taken. Voeg je eerste taak toe!
              </Card>
            ) : (
              <>
                <AnimatePresence>
                  {tasks.slice(0, 3).map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onEdit={() => setEditingTask(task)}
                    />
                  ))}
                </AnimatePresence>
                {tasks.length > 3 && (
                  <button 
                    onClick={() => setActiveTab('tasks')}
                    className="w-full py-3 text-sm text-primary font-medium hover:underline"
                  >
                    Bekijk alle {tasks.length} taken →
                  </button>
                )}
              </>
            )}
          </div>
        </motion.section>
      </main>

      {/* Edit Task Sheet */}
      <EditTaskSheet
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={updateTask}
        onDelete={deleteTask}
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
    </div>
  );
};

export default Index;
