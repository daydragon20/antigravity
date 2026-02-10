import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { EnergyLevel } from "@/types";

interface EnergyIndicatorProps {
  level: EnergyLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const energyConfig: Record<EnergyLevel, { label: string; color: string; bgColor: string }> = {
  1: { label: "Zeer laag", color: "bg-energy-low", bgColor: "bg-energy-low/20" },
  2: { label: "Laag", color: "bg-energy-low", bgColor: "bg-energy-low/20" },
  3: { label: "Gemiddeld", color: "bg-energy-medium", bgColor: "bg-energy-medium/20" },
  4: { label: "Hoog", color: "bg-energy-high", bgColor: "bg-energy-high/20" },
  5: { label: "Zeer hoog", color: "bg-energy-high", bgColor: "bg-energy-high/20" },
};

const sizeConfig = {
  sm: { bar: "h-1.5", container: "gap-0.5", width: "w-3" },
  md: { bar: "h-2", container: "gap-1", width: "w-4" },
  lg: { bar: "h-3", container: "gap-1.5", width: "w-5" },
};

export function EnergyIndicator({ 
  level, 
  size = "md", 
  showLabel = false,
  animated = true 
}: EnergyIndicatorProps) {
  const config = energyConfig[level];
  const sizeStyles = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex items-end", sizeStyles.container)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={animated ? { scaleY: 0 } : false}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={cn(
              sizeStyles.width,
              sizeStyles.bar,
              "rounded-full origin-bottom",
              i <= level ? config.color : "bg-muted"
            )}
            style={{ height: `${(i * 20) + 20}%` }}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {config.label}
        </span>
      )}
    </div>
  );
}
