import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TimeBlock } from "@/types";

interface DailyTimelineProps {
  blocks: TimeBlock[];
  currentHour?: number;
}

const blockTypeConfig = {
  task: { color: "bg-activity-task", label: "Taak" },
  meal: { color: "bg-activity-meal", label: "Maaltijd" },
  movement: { color: "bg-activity-movement", label: "Beweging" },
  rest: { color: "bg-activity-rest", label: "Rust" },
  free: { color: "bg-muted", label: "Vrij" },
};

export function DailyTimeline({ blocks, currentHour = new Date().getHours() }: DailyTimelineProps) {
  // Generate hour markers from 6 AM to 11 PM
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  return (
    <div className="relative">
      {/* Hour markers */}
      <div className="flex justify-between mb-2">
        {[6, 12, 18, 23].map((hour) => (
          <span key={hour} className="text-xs text-muted-foreground">
            {hour}:00
          </span>
        ))}
      </div>

      {/* Timeline bar */}
      <div className="relative h-12 bg-secondary rounded-2xl overflow-hidden">
        {/* Current time indicator */}
        {currentHour >= 6 && currentHour <= 23 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 bottom-0 w-0.5 bg-foreground z-20"
            style={{ left: `${((currentHour - 6) / 17) * 100}%` }}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-foreground" />
          </motion.div>
        )}

        {/* Time blocks */}
        {blocks.map((block, index) => {
          const startHour = block.startTime.getHours() + block.startTime.getMinutes() / 60;
          const endHour = block.endTime.getHours() + block.endTime.getMinutes() / 60;
          const left = ((startHour - 6) / 17) * 100;
          const width = ((endHour - startHour) / 17) * 100;
          const config = blockTypeConfig[block.type];

          if (startHour < 6 || endHour > 23) return null;

          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "absolute top-1 bottom-1 rounded-xl",
                config.color,
                block.type === 'task' && 'opacity-80'
              )}
              style={{ 
                left: `${Math.max(0, left)}%`, 
                width: `${Math.min(width, 100 - left)}%`,
                originX: 0 
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center flex-wrap">
        {Object.entries(blockTypeConfig).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded-full", config.color)} />
            <span className="text-xs text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
