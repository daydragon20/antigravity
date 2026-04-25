import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, CheckSquare, Square, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { Task, TabId } from "@/types";
import { toast } from "sonner";

interface ParsedTask {
  title: string;
  effort: "low" | "medium" | "high";
  importance: number;
  duration: number;
  category?: string;
  selected: boolean;
}

interface BrainDumpPageProps {
  onTasksAdded?: (tasks: Omit<Task, "id" | "createdAt" | "completed">[]) => void;
  onNavigate?: (tab: TabId) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/energy-coach`;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function BrainDumpPage({ onTasksAdded, onNavigate }: BrainDumpPageProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [phase, setPhase] = useState<"dump" | "review">("dump");
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggleMic = () => {
    if (!speechSupported) {
      toast.error("Spraakherkenning niet ondersteund in deze browser");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "nl-NL";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const processWithAI = async () => {
    if (!text.trim() || !user) return;
    setIsProcessing(true);

    const prompt = `Analyseer deze gedanken-dump en extraheer concrete taken. Geef ALLEEN een JSON array terug, geen uitleg.

Gedachten: "${text}"

Formaat (JSON array):
[{"title":"taak naam","effort":"low|medium|high","importance":1-5,"duration":15-120,"category":"work|health|creative|social|admin|other"}]

Regels:
- Elk item moet actionable zijn (met een werkwoord beginnen)
- effort: low = < 30min makkelijk, medium = matige concentratie, high = diepe focus
- importance: 5 = urgent/kritiek, 1 = nice-to-have
- duration: in minuten (realistisch)
- Maximaal 8 taken`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ message: prompt, mode: "braindump", userId: user.id }),
      });

      if (!resp.ok) throw new Error("API fout");

      let fullText = "";
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices?.[0]?.delta?.content) {
                fullText += data.choices[0].delta.content;
              }
            } catch {}
          }
        }
      }

      // Extract JSON from response
      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Geen geldige JSON ontvangen");

      const tasks: Omit<ParsedTask, "selected">[] = JSON.parse(jsonMatch[0]);
      setParsedTasks(tasks.map((t) => ({ ...t, selected: true })));
      setPhase("review");
    } catch (err) {
      // Fallback: simple line-by-line parsing
      const lines = text
        .split(/[.\n,;]+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 5);

      const fallback: ParsedTask[] = lines.slice(0, 6).map((line) => ({
        title: line.charAt(0).toUpperCase() + line.slice(1),
        effort: "medium" as const,
        importance: 3,
        duration: 30,
        category: "other",
        selected: true,
      }));

      setParsedTasks(fallback);
      setPhase("review");
      toast.info("AI niet beschikbaar — basisparsing gebruikt");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTask = (idx: number) => {
    setParsedTasks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, selected: !t.selected } : t))
    );
  };

  const confirmTasks = () => {
    const selected = parsedTasks.filter((t) => t.selected);
    if (selected.length === 0) return;

    onTasksAdded?.(
      selected.map((t) => ({
        title: t.title,
        effort: t.effort,
        importance: t.importance as any,
        duration: t.duration,
        category: t.category as any,
        source: "manual" as const,
      }))
    );

    toast.success(`${selected.length} taken toegevoegd!`);
    setText("");
    setParsedTasks([]);
    setPhase("dump");
    onNavigate?.("tasks");
  };

  const reset = () => {
    setParsedTasks([]);
    setPhase("dump");
  };

  const effortColor = (e: string) => {
    if (e === "low") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (e === "high") return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  };

  return (
    <div className="min-h-screen bg-background pb-28 flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Brain Dump</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {phase === "dump"
              ? "Gooi alles uit je hoofd — AI zet het om in taken"
              : "Selecteer welke taken je wilt toevoegen"}
          </p>
        </div>
      </header>

      <main className="flex-1 px-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === "dump" ? (
            <motion.div
              key="dump"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Text area */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Schrijf of spreek alles wat in je hoofd zit...

Voorbeelden:
• Ik moet nog de facturen versturen voor de klant
• Email beantwoorden van Sarah over het project
• Tandartsafspraak maken
• Sporttas inpakken voor morgen"
                  className={cn(
                    "min-h-[280px] text-base rounded-2xl resize-none border-2 transition-colors p-4",
                    isListening
                      ? "border-rose-400 bg-rose-50/50 dark:bg-rose-900/10"
                      : "border-border focus:border-primary/50"
                  )}
                />
                {isListening && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-rose-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Opnemen...
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {speechSupported && (
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    size="lg"
                    onClick={toggleMic}
                    className={cn("rounded-xl gap-2", isListening && "animate-pulse")}
                  >
                    {isListening ? (
                      <><MicOff className="w-5 h-5" /> Stop</>
                    ) : (
                      <><Mic className="w-5 h-5" /> Spreek</>
                    )}
                  </Button>
                )}

                <Button
                  size="lg"
                  onClick={processWithAI}
                  disabled={!text.trim() || isProcessing}
                  className="flex-1 rounded-xl gap-2 font-semibold"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Verwerken...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Verwerk met AI</>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Tik op de microfoon om in te spreken (nl-NL) of typ vrij
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {parsedTasks.map((task, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => toggleTask(idx)}
                  className={cn(
                    "rounded-2xl border p-4 cursor-pointer transition-all",
                    task.selected
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card opacity-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {task.selected
                      ? <CheckSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      : <Square className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}

                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{task.title}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium", effortColor(task.effort))}>
                          {task.effort === "low" ? "Makkelijk" : task.effort === "medium" ? "Gemiddeld" : "Intensief"}
                        </span>
                        <span className="text-xs text-muted-foreground">{task.duration}m</span>
                        <span className="text-xs text-muted-foreground">Belang {task.importance}/5</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={reset} className="gap-2 rounded-xl">
                  <RotateCcw className="w-4 h-4" /> Opnieuw
                </Button>
                <Button
                  onClick={confirmTasks}
                  disabled={parsedTasks.filter((t) => t.selected).length === 0}
                  className="flex-1 gap-2 rounded-xl font-semibold"
                >
                  <ArrowRight className="w-4 h-4" />
                  {parsedTasks.filter((t) => t.selected).length} taken toevoegen
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
