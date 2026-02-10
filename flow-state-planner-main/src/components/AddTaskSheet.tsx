import { useState } from "react";
import { Plus, Zap, Flag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EffortLevel, ImportanceLevel, Task } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AddTaskSheetProps {
  onAdd?: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
}

const effortOptions: { value: EffortLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Laag', color: 'bg-energy-high text-white' },
  { value: 'medium', label: 'Gemiddeld', color: 'bg-energy-medium text-white' },
  { value: 'high', label: 'Hoog', color: 'bg-energy-low text-white' },
];

export function AddTaskSheet({ onAdd }: AddTaskSheetProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [effort, setEffort] = useState<EffortLevel>("medium");
  const [importance, setImportance] = useState<ImportanceLevel>(3);
  const [duration, setDuration] = useState(30);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onAdd?.({
      title: title.trim(),
      description: description.trim() || undefined,
      effort,
      importance,
      duration,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setEffort("medium");
    setImportance(3);
    setDuration(30);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="gap-2 shadow-elevated">
          <Plus className="w-5 h-5" />
          Nieuwe taak
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle>Nieuwe taak toevoegen</SheetTitle>
          <SheetDescription>
            Voeg een taak toe en laat AI bepalen wanneer je deze het beste kunt doen.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              placeholder="Wat moet je doen?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving (optioneel)</Label>
            <Textarea
              id="description"
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
            Taak toevoegen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
