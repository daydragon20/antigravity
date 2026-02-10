import { motion } from "framer-motion";
import { Clock, Flag, Zap, CheckCircle2, Circle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { Card } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEdit?: () => void;
}

const effortConfig = {
  low: { label: "Laag", color: "text-energy-high", bars: 1 },
  medium: { label: "Gemiddeld", color: "text-energy-medium", bars: 2 },
  high: { label: "Hoog", color: "text-energy-low", bars: 3 },
};

export function TaskCard({ task, onToggleComplete, onEdit }: TaskCardProps) {
  const effort = effortConfig[task.effort];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card 
        className={cn(
          "p-4 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer",
          task.completed && "opacity-60"
        )}
        onClick={onEdit}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(task.id);
            }}
            className="mt-0.5 flex-shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-medium text-foreground",
              task.completed && "line-through"
            )}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {/* Effort indicator */}
              <div className={cn("flex items-center gap-1", effort.color)}>
                <Zap className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{effort.label}</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{task.duration} min</span>
              </div>

              {/* Importance */}
              <div className="flex items-center gap-1 text-accent">
                <Flag className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{task.importance}/5</span>
              </div>

              {/* Scheduled time */}
              {task.scheduledTime && (
                <span className="text-xs text-primary font-medium ml-auto">
                  {task.scheduledTime.toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}

              {/* Edit indicator */}
              {onEdit && (
                <Pencil className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
