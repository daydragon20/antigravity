import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabId } from "@/types";
import { useHabits } from "@/hooks/useHabits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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

interface HabitsPageProps {
  onNavigate?: (tab: TabId) => void;
}

const FREQUENCY_OPTIONS = [
  { value: "daily" as const, label: "Dagelijks" },
  { value: "weekly" as const, label: "Wekelijks" },
  { value: "monthly" as const, label: "Maandelijks" },
];

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4",
];

const WEEKDAY_SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export function HabitsPage({ onNavigate }: HabitsPageProps) {
  const { habits, loading, addHabit, deleteHabit, logHabit, getStreak, isLoggedToday, getLast7Days } = useHabits();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly" | "monthly">("daily");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addHabit({ title: newTitle.trim(), frequency: newFreq, targetCount: 1, color: newColor, icon: "check" });
    setNewTitle("");
    setNewFreq("daily");
    setNewColor(PRESET_COLORS[0]);
    setAddOpen(false);
  };

  const totalStreak = habits.reduce((sum, h) => sum + getStreak(h.id), 0);
  const doneToday = habits.filter((h) => isLoggedToday(h.id)).length;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="px-5 pt-14 pb-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Gewoonten</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {doneToday}/{habits.length} gedaan vandaag · {totalStreak} totale dagen
          </p>
        </div>
      </header>

      <main className="px-5 max-w-lg mx-auto space-y-3">
        {/* Stats bar */}
        {habits.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Beste streak</p>
                <p className="text-lg font-bold text-foreground">
                  {Math.max(...habits.map((h) => getStreak(h.id)), 0)} dagen
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Vandaag voltooid</p>
              <p className="text-lg font-bold text-foreground">{doneToday}/{habits.length}</p>
            </div>
            {habits.length > 0 && (
              <>
                <div className="h-8 w-px bg-border" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Voortgang</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${habits.length > 0 ? (doneToday / habits.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Habits list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
                <div className="h-4 bg-muted rounded-lg w-1/2 mb-3" />
                <div className="flex gap-1">{Array.from({ length: 7 }, (_, j) => <div key={j} className="w-8 h-8 bg-muted rounded-xl" />)}</div>
              </div>
            ))}
          </div>
        ) : habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🔥</div>
            <h3 className="font-semibold text-lg text-foreground">Nog geen gewoonten</h3>
            <p className="text-sm text-muted-foreground mt-1">Begin met één kleine gewoonte per dag</p>
            <Button onClick={() => setAddOpen(true)} className="mt-5 rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Eerste gewoonte
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {habits.map((habit, idx) => {
              const streak = getStreak(habit.id);
              const logged = isLoggedToday(habit.id);
              const last7 = getLast7Days(habit.id);

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Color bar */}
                    <div className="w-1 flex-shrink-0" style={{ backgroundColor: habit.color }} />

                    <div className="flex-1 p-4">
                      {/* Title row */}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
                          style={{ backgroundColor: habit.color }}
                        >
                          🔥
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{habit.title}</p>
                          <p className="text-xs text-muted-foreground">{habit.frequency === "daily" ? "Dagelijks" : habit.frequency === "weekly" ? "Wekelijks" : "Maandelijks"}</p>
                        </div>

                        {streak > 0 && (
                          <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1 rounded-xl">
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streak}</span>
                          </div>
                        )}

                        <button
                          onClick={() => setDeleteId(habit.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 7-day grid */}
                      <div className="flex gap-1.5 mb-3">
                        {last7.map((day, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold transition-all",
                                day.completed
                                  ? "text-white"
                                  : "bg-muted text-muted-foreground"
                              )}
                              style={day.completed ? { backgroundColor: habit.color } : {}}
                            >
                              {day.completed ? <Check className="w-3.5 h-3.5" /> : WEEKDAY_SHORT[i]}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Check-in button */}
                      <button
                        onClick={() => logHabit(habit.id)}
                        className={cn(
                          "w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]",
                          logged
                            ? "bg-muted text-muted-foreground"
                            : "text-white"
                        )}
                        style={!logged ? { backgroundColor: habit.color } : {}}
                      >
                        {logged ? "✓ Gedaan vandaag" : "Check in"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </main>

      {/* FAB */}
      {habits.length > 0 && (
        <button
          onClick={() => setAddOpen(true)}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-105 active:scale-95 transition-transform z-40"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}

      {/* Add Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <SheetHeader className="text-left">
              <SheetTitle>Nieuwe gewoonte</SheetTitle>
              <SheetDescription>Kies een gewoonte en begin vandaag</SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Naam</Label>
              <Input
                placeholder="bijv. 20 min wandelen, 8 glazen water..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-12 rounded-xl text-base"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Frequentie</Label>
              <div className="flex gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNewFreq(opt.value)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                      newFreq === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Kleur</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={cn(
                      "w-9 h-9 rounded-xl transition-all",
                      newColor === color && "ring-2 ring-foreground ring-offset-2"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              size="lg"
              className="w-full rounded-xl font-semibold"
            >
              Gewoonte toevoegen
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Gewoonte verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dit verwijdert ook alle logboeken. Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) deleteHabit(deleteId); setDeleteId(null); }}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
