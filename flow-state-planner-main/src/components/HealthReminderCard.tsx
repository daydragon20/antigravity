import { motion } from "framer-motion";
import { Utensils, Dumbbell, Moon, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthReminder, ReminderType } from "@/types";
import { Card } from "@/components/ui/card";

interface HealthReminderCardProps {
  reminder: HealthReminder;
  onToggleComplete?: (id: string) => void;
}

const reminderConfig: Record<ReminderType, { 
  icon: typeof Utensils; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  meal: { 
    icon: Utensils, 
    color: "text-activity-meal", 
    bgColor: "bg-activity-meal/10",
    label: "Maaltijd"
  },
  movement: { 
    icon: Dumbbell, 
    color: "text-activity-movement", 
    bgColor: "bg-activity-movement/10",
    label: "Beweging"
  },
  rest: { 
    icon: Moon, 
    color: "text-activity-rest", 
    bgColor: "bg-activity-rest/10",
    label: "Rust"
  },
};

export function HealthReminderCard({ reminder, onToggleComplete }: HealthReminderCardProps) {
  const config = reminderConfig[reminder.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
    >
      <Card 
        className={cn(
          "p-3 shadow-card hover:shadow-elevated transition-all duration-300",
          reminder.completed && "opacity-60"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", config.bgColor)}>
            <Icon className={cn("w-5 h-5", config.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-medium uppercase tracking-wide", config.color)}>
                {config.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {reminder.scheduledTime.toLocaleTimeString('nl-NL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <h4 className={cn(
              "font-medium text-foreground text-sm",
              reminder.completed && "line-through"
            )}>
              {reminder.title}
            </h4>
          </div>

          <button
            onClick={() => onToggleComplete?.(reminder.id)}
            className="flex-shrink-0"
          >
            {reminder.completed ? (
              <CheckCircle2 className={cn("w-5 h-5", config.color)} />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
