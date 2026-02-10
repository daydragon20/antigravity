import { motion } from "framer-motion";
import { Plus, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import type { EnergyLevel, MoodLevel, EnergyLog } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnergyTracker } from "@/components/EnergyTracker";
import { EnergyIndicator } from "@/components/EnergyIndicator";
import { MoodIndicator } from "@/components/MoodIndicator";

interface EnergyPageProps {
  currentEnergy: EnergyLevel;
  currentMood: MoodLevel;
  energyLogs: EnergyLog[];
  onLogEnergy: (energy: EnergyLevel, mood: MoodLevel) => void;
}

export function EnergyPage({ currentEnergy, currentMood, energyLogs, onLogEnergy }: EnergyPageProps) {
  const [showTracker, setShowTracker] = useState(false);

  const handleSubmit = (energy: EnergyLevel, mood: MoodLevel) => {
    onLogEnergy(energy, mood);
    setShowTracker(false);
  };

  // Get today's logs
  const today = new Date().toDateString();
  const todayLogs = energyLogs.filter(log => 
    new Date(log.timestamp).toDateString() === today
  );

  // Calculate averages
  const avgEnergy = todayLogs.length > 0 
    ? Math.round(todayLogs.reduce((sum, log) => sum + log.energy, 0) / todayLogs.length) as EnergyLevel
    : currentEnergy;
  const avgMood = todayLogs.length > 0
    ? Math.round(todayLogs.reduce((sum, log) => sum + log.mood, 0) / todayLogs.length) as MoodLevel
    : currentMood;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-8 pb-28 px-6"
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Energie</h1>
            <p className="text-muted-foreground">Track je welzijn</p>
          </div>
          <Button onClick={() => setShowTracker(!showTracker)} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Log
          </Button>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-5 shadow-card text-center">
            <p className="text-sm text-muted-foreground mb-2">Huidige energie</p>
            <div className="flex justify-center mb-2">
              <EnergyIndicator level={currentEnergy} size="lg" />
            </div>
            <p className="font-semibold text-foreground">
              {currentEnergy === 5 ? 'Zeer hoog' : 
               currentEnergy === 4 ? 'Hoog' : 
               currentEnergy === 3 ? 'Gemiddeld' : 
               currentEnergy === 2 ? 'Laag' : 'Zeer laag'}
            </p>
          </Card>
          <Card className="p-5 shadow-card text-center">
            <p className="text-sm text-muted-foreground mb-2">Huidige stemming</p>
            <div className="flex justify-center mb-2">
              <MoodIndicator level={currentMood} size="lg" />
            </div>
            <p className="font-semibold text-foreground">
              {currentMood === 5 ? 'Geweldig' : 
               currentMood === 4 ? 'Goed' : 
               currentMood === 3 ? 'Oké' : 
               currentMood === 2 ? 'Matig' : 'Slecht'}
            </p>
          </Card>
        </div>

        {/* Energy Tracker */}
        {showTracker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <EnergyTracker 
              onSubmit={handleSubmit}
              currentEnergy={currentEnergy}
              currentMood={currentMood}
            />
          </motion.div>
        )}

        {/* Today's Summary */}
        <Card className="p-5 shadow-card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Vandaag</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{todayLogs.length}</p>
              <p className="text-xs text-muted-foreground">Check-ins</p>
            </div>
            <div>
              <div className="flex justify-center mb-1">
                <EnergyIndicator level={avgEnergy} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground">Gem. energie</p>
            </div>
            <div>
              <div className="flex justify-center mb-1">
                <MoodIndicator level={avgMood} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground">Gem. stemming</p>
            </div>
          </div>
        </Card>

        {/* AI Insight */}
        <Card className="p-5 gradient-energy text-white shadow-elevated mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI Inzicht</h3>
              <p className="text-sm text-white/90">
                {currentEnergy >= 4 
                  ? "Je energie is hoog! Dit is een goed moment voor complexe taken."
                  : currentEnergy >= 3
                  ? "Je energie is gemiddeld. Overweeg lichtere taken of een korte pauze."
                  : "Je energie is laag. Neem een pauze en probeer wat beweging."}
              </p>
            </div>
          </div>
        </Card>

        {/* Log History */}
        <div>
          <h3 className="font-semibold mb-4">Recente logs</h3>
          <div className="space-y-3">
            {todayLogs.length === 0 ? (
              <Card className="p-6 text-center shadow-card">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nog geen logs vandaag</p>
                <p className="text-sm text-muted-foreground">Klik op "Log" om te beginnen</p>
              </Card>
            ) : (
              todayLogs.slice().reverse().map((log) => (
                <Card key={log.id} className="p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EnergyIndicator level={log.energy} size="sm" />
                      <MoodIndicator level={log.mood} size="sm" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString('nl-NL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
