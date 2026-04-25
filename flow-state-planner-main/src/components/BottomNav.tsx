import { motion } from "framer-motion";
import { Home, ListTodo, Brain, Timer, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "tasks", icon: ListTodo, label: "Taken" },
  { id: "braindump", icon: Brain, label: "Dump" },
  { id: "focus", icon: Timer, label: "Focus" },
  { id: "coach", icon: MessageCircle, label: "Coach" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-3 mb-3">
        <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl">
          <div className="flex items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className="relative flex-1 flex flex-col items-center gap-1 py-3 px-2"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-x-1 top-1.5 h-[calc(100%-6px)] bg-primary/10 rounded-xl"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                    />
                  )}
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative z-10"
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </motion.div>
                  <span
                    className={cn(
                      "text-[10px] font-medium relative z-10 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
