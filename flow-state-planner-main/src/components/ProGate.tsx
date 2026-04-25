import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface ProGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
  onUpgrade?: () => void;
}

export function ProGate({ children, feature, description, onUpgrade }: ProGateProps) {
  const { isPro } = useSubscription();
  if (isPro) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
        <Lock className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-base text-foreground mb-1">{feature}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      <Button
        onClick={onUpgrade}
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 rounded-xl gap-2 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20"
      >
        <Sparkles className="w-4 h-4" />
        Upgrade naar Pro
      </Button>
      <p className="text-xs text-muted-foreground mt-3">€2,99/maand · 7 dagen gratis proberen</p>
    </div>
  );
}
