import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MoodLevel } from "@/types";

interface MoodIndicatorProps {
  level: MoodLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const moodConfig: Record<MoodLevel, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😔", label: "Slecht", color: "text-mood-bad" },
  2: { emoji: "😕", label: "Matig", color: "text-mood-low" },
  3: { emoji: "😐", label: "Oké", color: "text-mood-okay" },
  4: { emoji: "🙂", label: "Goed", color: "text-mood-good" },
  5: { emoji: "😊", label: "Geweldig", color: "text-mood-great" },
};

const sizeConfig = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function MoodIndicator({ level, size = "md", showLabel = false }: MoodIndicatorProps) {
  const config = moodConfig[level];

  return (
    <div className="flex items-center gap-2">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={sizeConfig[size]}
      >
        {config.emoji}
      </motion.span>
      {showLabel && (
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
