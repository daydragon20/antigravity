import { motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FREE_FEATURES = [
  "Onbeperkt taken beheren",
  "Energie & stemming loggen",
  "Dagelijkse tijdlijn",
  "Brain dump (basis)",
  "AI Coach (basis)",
  "Gewoonten bijhouden",
];

const PRO_FEATURES = [
  "Alles in Gratis",
  "Slim inplannen (AI-algoritme)",
  "Wekelijks AI-rapport",
  "Wearable koppelingen (Fitbit, Oura, Garmin)",
  "Data export (CSV, ICS, JSON)",
  "Focus Timer + ambient sounds",
  "Google Calendar & Outlook sync",
  "Prioritaire AI Coach (sneller)",
];

export function UpgradePage({ onClose }: { onClose?: () => void }) {
  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="px-5 pt-14 pb-6 text-center relative">
        {onClose && (
          <button onClick={onClose} className="absolute top-14 right-5 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Flow State Pro</h1>
        <p className="text-muted-foreground mt-2 text-sm">De enige planner die echt voor je denkt</p>
      </header>

      <main className="px-5 max-w-lg mx-auto space-y-6">
        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground font-medium mb-1">Maandelijks</p>
            <p className="text-2xl font-bold text-foreground">€2,99</p>
            <p className="text-xs text-muted-foreground">/maand</p>
          </div>
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 text-center relative">
            <div className="absolute -top-2.5 left-0 right-0 flex justify-center">
              <span className="bg-amber-400 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">BESTE KEUZE</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">Jaarlijks</p>
            <p className="text-2xl font-bold text-foreground">€1,67</p>
            <p className="text-xs text-muted-foreground">/maand</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Bespaar 44%</p>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/50">
            <p className="text-sm font-semibold text-foreground">Wat je krijgt met Pro</p>
          </div>
          <div className="divide-y divide-border">
            {PRO_FEATURES.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-sm text-foreground">{f}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full rounded-2xl h-14 text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-xl shadow-amber-500/25 text-white"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start 7 dagen gratis
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Geen creditcard nodig voor de proefperiode. Annuleer wanneer je wilt.
          </p>
        </div>

        {/* Free plan */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Gratis plan</p>
          <div className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
