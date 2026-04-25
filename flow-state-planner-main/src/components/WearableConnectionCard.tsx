import { cn } from "@/lib/utils";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WearableConnectionCardProps {
  provider: "garmin" | "fitbit" | "oura" | "apple_health" | "samsung_health";
  connected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

const WEARABLE_CONFIG = {
  garmin: { name: "Garmin Connect", emoji: "⌚", color: "bg-[#007CC3]/10 text-[#007CC3]", description: "Hartslag, slaap, stress" },
  fitbit: { name: "Fitbit", emoji: "💚", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400", description: "Stappen, hartslag, slaap" },
  oura: { name: "Oura Ring", emoji: "💍", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", description: "HRV, slaapkwaliteit, gereedheid" },
  apple_health: { name: "Apple Health", emoji: "🍎", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", description: "Beweging, hartslag, slaap" },
  samsung_health: { name: "Samsung Health", emoji: "🔵", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", description: "Activiteit, slaap, stress" },
};

export function WearableConnectionCard({
  provider, connected, onConnect, onDisconnect, disabled, comingSoon
}: WearableConnectionCardProps) {
  const config = WEARABLE_CONFIG[provider];

  return (
    <div className={cn(
      "rounded-2xl border border-border bg-card p-4 flex items-center gap-3",
      (disabled || comingSoon) && "opacity-60"
    )}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0", config.color)}>
        {config.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-sm text-foreground">{config.name}</p>
          {comingSoon && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
              Binnenkort
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>

      {connected ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">Verbonden</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            className="text-muted-foreground hover:text-destructive h-7 text-xs rounded-lg"
          >
            Verbreek
          </Button>
        </div>
      ) : comingSoon ? (
        <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={onConnect}
          disabled={disabled}
          className="rounded-xl text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
        >
          Koppel <ExternalLink className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
