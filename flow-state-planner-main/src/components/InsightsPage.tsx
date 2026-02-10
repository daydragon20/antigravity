import { motion } from "framer-motion";
import { TrendingUp, Calendar, Zap, Brain, Target, Clock } from "lucide-react";
import type { Task, EnergyLog } from "@/types";
import { Card } from "@/components/ui/card";
import { EnergyIndicator } from "@/components/EnergyIndicator";

interface InsightsPageProps {
  tasks: Task[];
  energyLogs: EnergyLog[];
}

export function InsightsPage({ tasks, energyLogs }: InsightsPageProps) {
  // Calculate statistics
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  const avgEnergy = energyLogs.length > 0
    ? (energyLogs.reduce((sum, log) => sum + log.energy, 0) / energyLogs.length).toFixed(1)
    : '-';

  const avgMood = energyLogs.length > 0
    ? (energyLogs.reduce((sum, log) => sum + log.mood, 0) / energyLogs.length).toFixed(1)
    : '-';

  const totalMinutes = completedTasks.reduce((sum, t) => sum + t.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Energy by time of day
  const morningLogs = energyLogs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 6 && hour < 12;
  });
  const afternoonLogs = energyLogs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 12 && hour < 18;
  });
  const eveningLogs = energyLogs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 18 && hour < 24;
  });

  const getAvgEnergy = (logs: EnergyLog[]) => 
    logs.length > 0 ? Math.round(logs.reduce((sum, l) => sum + l.energy, 0) / logs.length) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-8 pb-28 px-6"
    >
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Inzichten</h1>
          <p className="text-muted-foreground">Bekijk je productiviteit en patronen</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-5 shadow-card">
            <Target className="w-6 h-6 text-primary mb-2" />
            <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
            <p className="text-sm text-muted-foreground">Voltooiingspercentage</p>
          </Card>
          <Card className="p-5 shadow-card">
            <Clock className="w-6 h-6 text-accent mb-2" />
            <p className="text-3xl font-bold text-foreground">
              {hours > 0 ? `${hours}u ${minutes}m` : `${minutes}m`}
            </p>
            <p className="text-sm text-muted-foreground">Productieve tijd</p>
          </Card>
          <Card className="p-5 shadow-card">
            <Zap className="w-6 h-6 text-energy-high mb-2" />
            <p className="text-3xl font-bold text-foreground">{avgEnergy}</p>
            <p className="text-sm text-muted-foreground">Gem. energie</p>
          </Card>
          <Card className="p-5 shadow-card">
            <Brain className="w-6 h-6 text-activity-rest mb-2" />
            <p className="text-3xl font-bold text-foreground">{avgMood}</p>
            <p className="text-sm text-muted-foreground">Gem. stemming</p>
          </Card>
        </div>

        {/* Energy Patterns */}
        <Card className="p-5 shadow-card mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Energiepatronen
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌅</span>
                <div>
                  <p className="font-medium">Ochtend</p>
                  <p className="text-xs text-muted-foreground">06:00 - 12:00</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <EnergyIndicator level={getAvgEnergy(morningLogs) as 1|2|3|4|5 || 3} size="sm" />
                <span className="text-sm font-medium">{morningLogs.length} logs</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">☀️</span>
                <div>
                  <p className="font-medium">Middag</p>
                  <p className="text-xs text-muted-foreground">12:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <EnergyIndicator level={getAvgEnergy(afternoonLogs) as 1|2|3|4|5 || 3} size="sm" />
                <span className="text-sm font-medium">{afternoonLogs.length} logs</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌙</span>
                <div>
                  <p className="font-medium">Avond</p>
                  <p className="text-xs text-muted-foreground">18:00 - 00:00</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <EnergyIndicator level={getAvgEnergy(eveningLogs) as 1|2|3|4|5 || 3} size="sm" />
                <span className="text-sm font-medium">{eveningLogs.length} logs</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Task Breakdown */}
        <Card className="p-5 shadow-card mb-8">
          <h3 className="font-semibold mb-4">Taakanalyse</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Totaal taken</span>
              <span className="font-semibold">{tasks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Voltooid</span>
              <span className="font-semibold text-energy-high">{completedTasks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Open</span>
              <span className="font-semibold text-accent">{tasks.length - completedTasks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Hoge inspanning</span>
              <span className="font-semibold">{tasks.filter(t => t.effort === 'high').length}</span>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-5 gradient-calm shadow-card">
          <h3 className="font-semibold mb-3">💡 Tip van de dag</h3>
          <p className="text-sm text-muted-foreground">
            {getAvgEnergy(morningLogs) > getAvgEnergy(afternoonLogs)
              ? "Je ochtenden zijn je meest energieke momenten. Plan belangrijke taken voor de ochtend!"
              : getAvgEnergy(afternoonLogs) > getAvgEnergy(eveningLogs)
              ? "Je middagen zijn productief. Gebruik deze tijd voor focuswerk."
              : "Begin met het loggen van je energie om gepersonaliseerde inzichten te krijgen."}
          </p>
        </Card>
      </div>
    </motion.div>
  );
}
