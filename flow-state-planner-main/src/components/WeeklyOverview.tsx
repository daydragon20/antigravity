import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TimeBlock, Task } from "@/types";
import { Calendar, CheckCircle2, Circle } from "lucide-react";

interface WeeklyOverviewProps {
    blocks: TimeBlock[];
}

export function WeeklyOverview({ blocks }: WeeklyOverviewProps) {
    // Group blocks by day for the next 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0);
        return date;
    });

    const groupedBlocks = days.map(day => {
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const dayBlocks = blocks.filter(block =>
            block.startTime >= day && block.startTime <= dayEnd
        ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        return {
            day,
            blocks: dayBlocks
        };
    });

    return (
        <div className="space-y-6">
            {groupedBlocks.map(({ day, blocks: dayBlocks }, index) => (
                <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8"
                >
                    {/* Day Label */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40">
                        <div className="absolute top-1.5 -left-1 w-2 h-2 rounded-full bg-primary" />
                    </div>

                    <div className="mb-3">
                        <h4 className="text-sm font-semibold text-foreground capitalize">
                            {day.toLocaleDateString('nl-NL', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short'
                            })}
                            {index === 0 && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Vandaag</span>}
                        </h4>
                    </div>

                    <div className="space-y-2">
                        {dayBlocks.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Geen taken gepland</p>
                        ) : (
                            dayBlocks.map((block) => {
                                const task = block.item as Task;
                                const isCalendar = block.id.startsWith('gcal-') ||
                                    block.id.startsWith('outlook-') ||
                                    (task && 'source' in task && !!task.source);

                                const source = (task && 'source' in task && task.source) ||
                                    (block.id.startsWith('gcal-') ? 'google' :
                                        block.id.startsWith('outlook-') ? 'outlook' : null);

                                return (
                                    <div
                                        key={block.id}
                                        className={cn(
                                            "group flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:bg-card hover:shadow-sm hover:border-border/80",
                                            isCalendar && source === 'google' && "border-l-4 border-l-red-400",
                                            isCalendar && source === 'outlook' && "border-l-4 border-l-blue-400"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isCalendar ? (
                                                <div className={cn(
                                                    "p-1.5 rounded-lg",
                                                    source === 'google' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                            ) : (
                                                <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                                    <Circle className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-medium text-foreground line-clamp-1">
                                                    {block.item?.title || '(Geen titel)'}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                    {block.startTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                                    {isCalendar && (
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider",
                                                            source === 'google' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                                                        )}>
                                                            {source}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
