import { useState } from "react";
import { Plus, Zap, Flag, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EffortLevel, ImportanceLevel, Task, TaskCategory, RecurrenceRule } from "@/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddTaskSheetProps {
  onAdd?: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const effortOptions: { value: EffortLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Makkelijk', color: 'bg-emerald-500 text-white' },
  { value: 'medium', label: 'Gemiddeld', color: 'bg-amber-500 text-white' },
  { value: 'high', label: 'Intensief', color: 'bg-rose-500 text-white' },
];

const categoryOptions: { value: TaskCategory; label: string; emoji: string }[] = [
  { value: 'work', label: 'Werk', emoji: '💼' },
  { value: 'health', label: 'Gezondheid', emoji: '🏃' },
  { value: 'creative', label: 'Creatief', emoji: '🎨' },
  { value: 'social', label: 'Sociaal', emoji: '👥' },
  { value: 'admin', label: 'Admin', emoji: '📋' },
  { value: 'other', label: 'Overig', emoji: '📌' },
];

const recurrenceOptions: { value: RecurrenceRule | ''; label: string }[] = [
  { value: '', label: 'Eenmalig' },
  { value: 'daily', label: 'Dagelijks' },
  { value: 'weekly', label: 'Wekelijks' },
  { value: 'monthly', label: 'Maandelijks' },
];

export function AddTaskSheet({ onAdd, open: controlledOpen, onOpenChange }: AddTaskSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) onOpenChange?.(val);
    else setInternalOpen(val);
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [effort, setEffort] = useState<EffortLevel>("medium");
  const [importance, setImportance] = useState<ImportanceLevel>(3);
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState<TaskCategory>("other");
  const [recurrence, setRecurrence] = useState<RecurrenceRule | ''>('');

  const handleSubmit = () => {
    if (!title.trim()) return;

    onAdd?.({
      title: title.trim(),
      description: description.trim() || undefined,
      effort,
      importance,
      duration,
      category,
      source: 'manual',
      recurrenceRule: recurrence || undefined,
    });

    setTitle("");
    setDescription("");
    setEffort("medium");
    setImportance(3);
    setDuration(30);
    setCategory("other");
    setRecurrence('');
    setOpen(false);
  };

  const content = (
    <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 overflow-hidden flex flex-col">
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl">Nieuwe taak</SheetTitle>
          <SheetDescription>Voeg een taak toe aan je lijst</SheetDescription>
        </SheetHeader>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Wat moet je doen?</Label>
          <Input
            placeholder="Taak beschrijving..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && title.trim() && handleSubmit()}
            className="text-base h-12 rounded-xl"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground">Notities (optioneel)</Label>
          <Textarea
            placeholder="Extra details, context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="rounded-xl resize-none"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Categorie</Label>
          <div className="flex gap-2 flex-wrap">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={cn(
                  "py-2 px-3 rounded-xl text-sm font-medium transition-all border",
                  category === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/50"
                )}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Effort */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Inspanning
          </Label>
          <div className="flex gap-2">
            {effortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setEffort(option.value)}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-xl font-medium text-sm transition-all",
                  effort === option.value
                    ? option.color + " shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Importance */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-rose-500" /> Belang
          </Label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as ImportanceLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setImportance(level)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-bold text-sm transition-all",
                  importance === level
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" /> Duur
          </Label>
          <div className="flex gap-2 flex-wrap">
            {[15, 30, 45, 60, 90, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={cn(
                  "py-2 px-3.5 rounded-xl font-medium text-sm transition-all",
                  duration === mins
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {mins >= 60 ? `${mins / 60}u` : `${mins}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Recurrence */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-indigo-500" /> Herhaling
          </Label>
          <div className="flex gap-2 flex-wrap">
            {recurrenceOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRecurrence(opt.value as RecurrenceRule | '')}
                className={cn(
                  "py-2 px-3.5 rounded-xl font-medium text-sm transition-all",
                  recurrence === opt.value
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 pt-4 border-t border-border">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="w-full rounded-xl h-13 text-base font-semibold"
          disabled={!title.trim()}
        >
          <Plus className="w-5 h-5 mr-2" />
          Taak toevoegen
        </Button>
      </div>
    </SheetContent>
  );

  if (isControlled) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        {content}
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="gap-2 shadow-elevated rounded-xl">
          <Plus className="w-5 h-5" />
          Nieuwe taak
        </Button>
      </SheetTrigger>
      {content}
    </Sheet>
  );
}
