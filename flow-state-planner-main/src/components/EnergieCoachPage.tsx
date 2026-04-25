import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import type { TabId } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface EnergieCoachPageProps {
  onNavigate?: (tab: TabId) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/energy-coach`;

const quickPrompts = [
  { label: "⚡ Meer energie", message: "Ik wil mijn energie verhogen, wat raad je aan?" },
  { label: "😌 Ontspannen", message: "Ik ben moe en gestrest, help me ontspannen." },
  { label: "🎯 Prioriteiten", message: "Help me mijn prioriteiten voor vandaag bepalen." },
  { label: "🧠 Focus", message: "Ik heb moeite me te concentreren, wat kan ik doen?" },
  { label: "💪 Motivatie", message: "Ik heb weinig motivatie vandaag, hoe kom ik op gang?" },
  { label: "📊 Weekanalyse", message: "Analyseer mijn productiviteitspatronen van deze week." },
];

export function EnergieCoachPage({ onNavigate }: EnergieCoachPageProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .not("role", "eq", "weekly_report")
        .order("created_at", { ascending: true })
        .limit(50);
      if (data?.length) {
        setMessages(data.map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
      }
    };
    load();
  }, [user]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: userMsg.content });

    let assistantSoFar = "";
    const assistantId = crypto.randomUUID();

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === assistantId) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { id: assistantId, role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Fout" }));
        toast.error(err.error || "Er ging iets mis");
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl).trimEnd();
          buf = buf.slice(nl + 1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const d = JSON.parse(json);
            const c = d.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {}
        }
      }

      if (assistantSoFar) {
        await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: assistantSoFar });
      }
    } catch {
      toast.error("Kon geen verbinding maken met de Coach");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([]);
    toast.success("Gesprek gewist");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="px-5 pt-14 pb-4 border-b border-border/50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">EnergieCoach</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs text-muted-foreground">Online · AI-assistent</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearChat} className="w-8 h-8 text-muted-foreground">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 max-w-lg mx-auto w-full space-y-4"
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-5 shadow-xl shadow-violet-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Hallo! 👋</h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-8">
              Ik ben jouw EnergieCoach. Ik ken jouw agenda, energie en gewoonten. Vraag me alles!
            </p>

            <div className="grid grid-cols-2 gap-2 w-full">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.message)}
                  className="px-3 py-2.5 text-xs font-medium rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors text-left"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {msg.role === "assistant" ? "✨" : "J"}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>ul]:my-1.5 [&>ol]:my-1.5 [&>li]:my-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-2"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs flex-shrink-0">
                  ✨
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Quick prompts strip */}
      {messages.length > 0 && !isLoading && (
        <div className="px-5 pb-2 max-w-lg mx-auto w-full">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickPrompts.slice(0, 4).map((qp) => (
              <button
                key={qp.label}
                onClick={() => sendMessage(qp.message)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-5 pb-4 max-w-lg mx-auto w-full">
        <div className="flex gap-2 items-end bg-card border border-border rounded-2xl px-4 py-2 shadow-sm focus-within:border-primary/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
            }}
            placeholder="Stel een vraag aan de Coach..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1"
            style={{ maxHeight: 100 }}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-xl w-9 h-9 flex-shrink-0 bg-primary"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
