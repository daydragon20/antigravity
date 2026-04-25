import { useState } from "react";
import { Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { autoScheduleTasks } from "@/lib/taskScheduler";
import { useEnergyLogs } from "@/hooks/useEnergyLogs";
import { useProfile } from "@/contexts/ProfileContext";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface AutoScheduleButtonProps {
  tasks: Task[];
  onScheduled: () => void;
}

export function AutoScheduleButton({ tasks, onScheduled }: AutoScheduleButtonProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Task[]>([]);
  const { energyLogs } = useEnergyLogs();
  const { preferences } = useProfile();
  const { updateTask } = useTasks();

  const handlePreview = () => {
    const result = autoScheduleTasks(tasks, energyLogs, preferences);
    const changed = result.filter((t) => {
      const orig = tasks.find((o) => o.id === t.id);
      return orig && t.scheduledTime?.getTime() !== orig.scheduledTime?.getTime();
    });
    setPreview(changed);
    setOpen(true);
  };

  const handleConfirm = async () => {
    for (const task of preview) {
      await updateTask(task);
    }
    setOpen(false);
    onScheduled();
  };

  if (tasks.filter((t) => !t.completed && !t.scheduledTime).length === 0) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreview}
        className="gap-1.5 rounded-xl text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Slim inplannen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Slim ingepland
            </DialogTitle>
            <DialogDescription>
              AI heeft {preview.length} taken ingepland op basis van jouw energie en werktijden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {preview.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Geen taken om in te plannen.
              </p>
            ) : (
              preview.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.scheduledTime
                        ? format(task.scheduledTime, "EEEE HH:mm", { locale: nl })
                        : "—"}
                    </p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-lg font-medium", {
                    "bg-emerald-100 text-emerald-700": task.effort === "low",
                    "bg-amber-100 text-amber-700": task.effort === "medium",
                    "bg-rose-100 text-rose-700": task.effort === "high",
                  })}>
                    {task.effort === "low" ? "💚" : task.effort === "medium" ? "🟡" : "🔴"}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-xl">
              Annuleren
            </Button>
            <Button onClick={handleConfirm} className="flex-1 rounded-xl" disabled={preview.length === 0}>
              Toepassen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
