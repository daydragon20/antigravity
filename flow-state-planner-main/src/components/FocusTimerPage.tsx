import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, TabId } from "@/types";
import { useNotifications } from "@/hooks/useNotifications";

interface FocusTimerPageProps {
  tasks?: Task[];
  onTaskComplete?: (id: string) => void;
  onNavigate?: (tab: TabId) => void;
}

type Phase = "work" | "shortBreak" | "longBreak";

const PHASES: Record<Phase, { label: string; duration: number; color: string; bg: string }> = {
  work: { label: "Focus", duration: 25 * 60, color: "text-violet-500", bg: "from-violet-500 to-indigo-600" },
  shortBreak: { label: "Korte pauze", duration: 5 * 60, color: "text-emerald-500", bg: "from-emerald-400 to-teal-500" },
  longBreak: { label: "Lange pauze", duration: 15 * 60, color: "text-blue-500", bg: "from-blue-400 to-cyan-500" },
};

type SoundOption = "none" | "rain" | "whitenoise";

const SOUNDS: { id: SoundOption; label: string; emoji: string }[] = [
  { id: "none", label: "Stilte", emoji: "🔇" },
  { id: "rain", label: "Regen", emoji: "🌧️" },
  { id: "whitenoise", label: "White noise", emoji: "〰️" },
];

function CircularProgress({ progress, phase }: { progress: number; phase: Phase }) {
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width="264" height="264" viewBox="0 0 264 264" className="rotate-[-90deg]">
      {/* Track */}
      <circle cx="132" cy="132" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
      {/* Progress */}
      <circle
        cx="132" cy="132" r={radius}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className={cn("transition-all duration-1000", {
          "stroke-violet-500": phase === "work",
          "stroke-emerald-500": phase === "shortBreak",
          "stroke-blue-500": phase === "longBreak",
        })}
      />
    </svg>
  );
}

export function FocusTimerPage({ tasks = [], onTaskComplete, onNavigate }: FocusTimerPageProps) {
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(PHASES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sound, setSound] = useState<SoundOption>("none");
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] ?? null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const { sendNotification } = useNotifications();

  const currentPhase = PHASES[phase];
  const progress = (currentPhase.duration - secondsLeft) / currentPhase.duration;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const nextPhase = useCallback(() => {
    setIsRunning(false);
    if (phase === "work") {
      const next = sessionCount % 4 === 3 ? "longBreak" : "shortBreak";
      setPhase(next);
      setSecondsLeft(PHASES[next].duration);
      sendNotification?.(`${PHASES[next].label} tijd!`, { body: "Goed gedaan! Neem even rust." });
      if (sessionCount % 4 === 3 && selectedTask) {
        onTaskComplete?.(selectedTask.id);
      }
      setSessionCount((s) => s + 1);
    } else {
      setPhase("work");
      setSecondsLeft(PHASES.work.duration);
      sendNotification?.("Focustijd!", { body: "Tijd om weer aan de slag te gaan." });
    }
  }, [phase, sessionCount, selectedTask, onTaskComplete, sendNotification]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            nextPhase();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, nextPhase]);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(currentPhase.duration);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="min-h-screen bg-background pb-28 flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-2">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Focus Timer</h1>
          <p className="text-sm text-muted-foreground">Pomodoro · {sessionCount} sessies voltooid</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pt-4 max-w-lg mx-auto w-full">
        {/* Phase selector */}
        <div className="flex bg-secondary rounded-xl p-1 gap-1 mb-8 w-full">
          {(Object.keys(PHASES) as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPhase(p); setSecondsLeft(PHASES[p].duration); setIsRunning(false); }}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
                phase === p ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              {PHASES[p].label}
            </button>
          ))}
        </div>

        {/* Circular timer */}
        <div className="relative flex items-center justify-center mb-8">
          <CircularProgress progress={progress} phase={phase} />
          <div className="absolute text-center">
            <div className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
              {formatTime(secondsLeft)}
            </div>
            <div className={cn("text-sm font-semibold mt-1", currentPhase.color)}>
              {currentPhase.label}
            </div>
          </div>
        </div>

        {/* Selected task */}
        {pendingTasks.length > 0 && (
          <button
            onClick={() => setShowTaskPicker((p) => !p)}
            className="w-full mb-6 p-4 rounded-2xl border border-border bg-card text-left flex items-center gap-3 hover:border-primary/40 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Bezig met</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {selectedTask?.title ?? "Kies een taak…"}
              </p>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showTaskPicker && "rotate-180")} />
          </button>
        )}

        <AnimatePresence>
          {showTaskPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full overflow-hidden mb-6"
            >
              <div className="space-y-1.5 bg-secondary rounded-2xl p-2">
                {pendingTasks.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTask(t); setShowTaskPicker(false); }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      selectedTask?.id === t.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-background text-foreground"
                    )}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="w-12 h-12 rounded-full"
          >
            <SkipForward className="w-5 h-5 rotate-180" />
          </Button>

          <Button
            onClick={() => setIsRunning((r) => !r)}
            className={cn(
              "w-20 h-20 rounded-full text-white shadow-2xl transition-all active:scale-95",
              `bg-gradient-to-br ${currentPhase.bg}`
            )}
          >
            {isRunning
              ? <Pause className="w-8 h-8" />
              : <Play className="w-8 h-8 ml-1" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextPhase}
            className="w-12 h-12 rounded-full"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Sound selector */}
        <div className="w-full">
          <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">Ambient geluid</p>
          <div className="flex gap-2 justify-center">
            {SOUNDS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSound(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-medium transition-all",
                  sound === s.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-lg">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Session dots */}
        <div className="flex gap-2 mt-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                i < (sessionCount % 4) ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Na 4 sessies: lange pauze</p>
      </main>
    </div>
  );
}
