import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnergyLevel, MoodLevel } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EnergyTrackerProps {
  onSubmit?: (energy: EnergyLevel, mood: MoodLevel) => void;
  currentEnergy?: EnergyLevel;
  currentMood?: MoodLevel;
}

const energyOptions: { value: EnergyLevel; emoji: string; label: string }[] = [
  { value: 1, emoji: "🪫", label: "Zeer laag" },
  { value: 2, emoji: "🔋", label: "Laag" },
  { value: 3, emoji: "⚡", label: "Gemiddeld" },
  { value: 4, emoji: "💪", label: "Hoog" },
  { value: 5, emoji: "🚀", label: "Zeer hoog" },
];

const moodOptions: { value: MoodLevel; emoji: string; label: string }[] = [
  { value: 1, emoji: "😔", label: "Slecht" },
  { value: 2, emoji: "😕", label: "Matig" },
  { value: 3, emoji: "😐", label: "Oké" },
  { value: 4, emoji: "🙂", label: "Goed" },
  { value: 5, emoji: "😊", label: "Geweldig" },
];

export function EnergyTracker({ onSubmit, currentEnergy, currentMood }: EnergyTrackerProps) {
  const [energy, setEnergy] = useState<EnergyLevel | null>(currentEnergy || null);
  const [mood, setMood] = useState<MoodLevel | null>(currentMood || null);

  const handleSubmit = () => {
    if (energy && mood) {
      onSubmit?.(energy, mood);
    }
  };

  return (
    <Card className="p-6 shadow-elevated gradient-calm">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Hoe voel je je nu?</h3>
      </div>

      {/* Energy Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Energieniveau
        </label>
        <div className="flex gap-2 justify-between">
          {energyOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEnergy(option.value)}
              className={cn(
                "flex-1 p-3 rounded-xl border-2 transition-all duration-200",
                energy === option.value
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-card hover:bg-secondary"
              )}
            >
              <span className="text-2xl block mb-1">{option.emoji}</span>
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Stemming
        </label>
        <div className="flex gap-2 justify-between">
          {moodOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(option.value)}
              className={cn(
                "flex-1 p-3 rounded-xl border-2 transition-all duration-200",
                mood === option.value
                  ? "border-accent bg-accent/10"
                  : "border-transparent bg-card hover:bg-secondary"
              )}
            >
              <span className="text-2xl block mb-1">{option.emoji}</span>
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={!energy || !mood}
        className="w-full"
        size="lg"
      >
        Opslaan
      </Button>
    </Card>
  );
}
