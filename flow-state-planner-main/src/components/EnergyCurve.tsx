import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface EnergyCurveProps {
    className?: string;
}

export function EnergyCurve({ className }: EnergyCurveProps) {
    // A simplified energy curve: starting low (waking up), peaking before lunch, dip after lunch, peak afternoon, gradual decline.
    // 0h: 1, 6h: 2, 9h: 4, 12h: 4, 14h: 2.5, 16h: 4, 20h: 3, 23h: 1

    // SVG Path coordinates for a smooth curve roughly matching the above pattern
    // ViewBox 0 0 100 50 (Coordinate system)
    // We'll overlay tasks on this later in Phase 2.

    return (
        <div className={cn("relative w-full h-32 overflow-hidden", className)}>
            <div className="absolute inset-0 flex items-end">
                <svg
                    viewBox="0 0 100 50"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(200, 40%, 90%)" /> {/* Morning/Sleepy - Blueish */}
                            <stop offset="30%" stopColor="hsl(155, 60%, 65%)" /> {/* Peak - Green */}
                            <stop offset="55%" stopColor="hsl(45, 90%, 65%)" /> {/* Dip - Yellowish */}
                            <stop offset="70%" stopColor="hsl(155, 60%, 65%)" /> {/* Afternoon Peak - Green */}
                            <stop offset="100%" stopColor="hsl(260, 40%, 70%)" /> {/* Evening - Purplish */}
                        </linearGradient>
                    </defs>

                    {/* Detailed Path based on:
              0,45 (Start low)
              10,40
              25,10 (9am Peak)
              40,15 (Pre-lunch sustain)
              55,35 (Post-lunch dip)
              70,15 (Afternoon flow)
              90,40 (Evening wind-down)
              100,45 (Sleep)
          */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d="M0,45 C15,45 20,10 35,12 C50,14 55,35 60,30 C75,15 80,15 100,45 L100,50 L0,50 Z"
                        fill="url(#energyGradient)"
                        fillOpacity="0.4"
                        stroke="url(#energyGradient)"
                        strokeWidth="0.5"
                    />
                </svg>
            </div>

            {/* Time markers */}
            <div className="absolute bottom-0 w-full flex justify-between px-2 text-[10px] text-muted-foreground/60 font-medium">
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>22:00</span>
            </div>

            {/* Title overlay */}
            <div className="absolute top-2 left-2">
                <p className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-energy-high"></span> Jouw Ritme
                </p>
            </div>
        </div>
    );
}
