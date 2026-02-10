import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap, Flag, Clock, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, EffortLevel, ImportanceLevel } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditTaskSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
}

const effortOptions: { value: EffortLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Laag', color: 'bg-energy-high text-white' },
  { value: 'medium', label: 'Gemiddeld', color: 'bg-energy-medium text-white' },
  { value: 'high', label: 'Hoog', color: 'bg-energy-low text-white' },
];

export function EditTaskSheet({ task, open, onOpenChange, onSave, onDelete }: EditTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [effort, setEffort] = useState<EffortLevel>("medium");
  const [importance, setImportance] = useState<ImportanceLevel>(3);
  const [duration, setDuration] = useState(30);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setEffort(task.effort);
      setImportance(task.importance);
      setDuration(task.duration);
    }
  }, [task]);

  const handleSubmit = () => {
    if (!task || !title.trim()) return;

    onSave({
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      effort,
      importance,
      duration,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle>Taak bewerken</SheetTitle>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
            <SheetDescription>
              Pas de taak aan of verwijder hem.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 overflow-y-auto">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel</Label>
              <Input
                id="edit-title"
                placeholder="Wat moet je doen?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschrijving (optioneel)</Label>
              <Textarea
                id="edit-description"
                placeholder="Voeg details toe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Effort */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Inspanning
              </Label>
              <div className="flex gap-2">
                {effortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEffort(option.value)}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all",
                      effort === option.value
                        ? option.color
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Importance */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Belangrijkheid
              </Label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as ImportanceLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setImportance(level)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all",
                      importance === level
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Geschatte duur
              </Label>
              <div className="flex gap-2 flex-wrap">
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={cn(
                      "py-2 px-4 rounded-xl font-medium text-sm transition-all",
                      duration === mins
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {mins >= 60 ? `${mins / 60}u` : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleSubmit} 
              size="lg" 
              className="w-full"
              disabled={!title.trim()}
            >
              Wijzigingen opslaan
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Taak verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{task?.title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
