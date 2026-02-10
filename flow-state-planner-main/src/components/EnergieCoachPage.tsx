import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/energy-coach`;

const quickPrompts = [
  { label: "⚡ Energie verhogen", message: "Ik wil mijn energie verhogen, wat raad je aan?" },
  { label: "😌 Ontspannen", message: "Ik ben moe en gestrest, help me ontspannen." },
  { label: "🎨 Creatief bezig", message: "Ik wil iets creatiefs doen, wat kan ik doen?" },
  { label: "🧠 Mentale boost", message: "Ik verveel me, geef me een mentale uitdaging." },
  { label: "👥 Sociaal contact", message: "Ik wil meer sociale interactie, wat stel je voor?" },
  { label: "📚 Iets leren", message: "Ik wil iets nieuws leren, welke activiteit past bij mijn energie?" },
];

export function EnergieCoachPage() {
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

  // Load chat history
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (data && data.length > 0) {
        setMessages(data.map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
      }
    };
    loadHistory();
  }, [user]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Save user message
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: userMsg.content });

    let assistantSoFar = "";
    const assistantId = crypto.randomUUID();

    const upsertAssistant = (chunk: string) => {
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
        setIsLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      // Save assistant message
      if (assistantSoFar) {
        await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: assistantSoFar });
      }
    } catch (e) {
      console.error(e);
      toast.error("Kon geen verbinding maken met EnergieCoach");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    setMessages([]);
    // We can't delete due to RLS, but we can clear local state
    // For a fresh start the user just gets a clean view
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col pt-4 pb-24"
    >
      <div className="max-w-lg mx-auto w-full flex flex-col flex-1 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl gradient-energy">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EnergieCoach</h1>
              <p className="text-xs text-muted-foreground">Jouw persoonlijke welzijnsassistent</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearChat} className="text-muted-foreground">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[300px] max-h-[60vh]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="p-4 rounded-3xl gradient-energy mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Hallo! 👋</h2>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
                Ik ben je EnergieCoach. Vertel me hoe je je voelt en ik stel de perfecte activiteit voor!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => sendMessage(qp.message)}
                    className="px-3 py-2 text-xs font-medium rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="p-1.5 rounded-xl gradient-energy h-fit mt-1 shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border shadow-card"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="p-1.5 rounded-xl bg-primary/10 h-fit mt-1 shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="p-1.5 rounded-xl gradient-energy h-fit mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <Card className="px-4 py-3 shadow-card">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Quick prompts when in conversation */}
        {messages.length > 0 && !isLoading && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
            {quickPrompts.slice(0, 4).map((qp) => (
              <button
                key={qp.label}
                onClick={() => sendMessage(qp.message)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Vraag me iets..."
              rows={1}
              className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              style={{ maxHeight: 120 }}
            />
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-2xl h-11 w-11 shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
