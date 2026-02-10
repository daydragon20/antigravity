import { TaskCategory, EffortLevel, ImportanceLevel } from "@/types";

interface ParsedTask {
    title: string;
    category?: TaskCategory;
    effort?: EffortLevel;
    importance?: ImportanceLevel;
    duration?: number;
    scheduledDate?: Date;
}

export function parseSmartInput(input: string): ParsedTask {
    let title = input;
    let category: TaskCategory | undefined;
    let effort: EffortLevel | undefined;
    let importance: ImportanceLevel | undefined;
    let duration: number | undefined;
    let scheduledDate: Date | undefined;

    // 1. Parse Category (#work, #health, etc.)
    const categoryMatch = title.match(/#(werk|work|gezond|health|creatief|creative|sociaal|social|admin|overig|other)/i);
    if (categoryMatch) {
        const rawCat = categoryMatch[1].toLowerCase();
        const catMap: Record<string, TaskCategory> = {
            werk: 'work', work: 'work',
            gezond: 'health', health: 'health',
            creatief: 'creative', creative: 'creative',
            sociaal: 'social', social: 'social',
            admin: 'admin',
            overig: 'other', other: 'other'
        };
        category = catMap[rawCat] || 'other';
        title = title.replace(categoryMatch[0], '').trim();
    }

    // 2. Parse Importance (!belangrijk, !important or !1, !2, !3)
    const importanceMatch = title.match(/!(belangrijk|important|high|urgent|[1-5])/i);
    if (importanceMatch) {
        const val = importanceMatch[1];
        if (val.match(/[1-5]/)) {
            importance = parseInt(val) as ImportanceLevel;
        } else {
            importance = 4; // Default high importance
        }
        title = title.replace(importanceMatch[0], '').trim();
    }

    // 3. Parse Effort (~laag, ~gemiddeld, ~hoog, ~low, ~medium, ~high)
    const effortMatch = title.match(/~(laag|low|gemiddeld|medium|hoog|high)/i);
    if (effortMatch) {
        const val = effortMatch[1].toLowerCase();
        if (['laag', 'low'].includes(val)) effort = 'low';
        else if (['hoog', 'high'].includes(val)) effort = 'high';
        else effort = 'medium';
        title = title.replace(effortMatch[0], '').trim();
    }

    // 4. Parse Duration (15m, 1h, 1.5u)
    const durationMatch = title.match(/\b(\d+(?:\.\d+)?)(m|min|u|h|uur)\b/i);
    if (durationMatch) {
        const val = parseFloat(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        if (['u', 'h', 'uur'].includes(unit)) {
            duration = Math.round(val * 60);
        } else {
            duration = Math.round(val);
        }
        title = title.replace(durationMatch[0], '').trim();
    }

    // 5. Basic Time Parsing (om 14:00, tomorrow, morgen) - VERY BASIC MVP
    // For a real app, use chrono-node or date-fns
    const timeMatch = title.match(/\b(?:om|at)\s+(\d{1,2})[:.](\d{2})\b/i);
    if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        if (date < new Date()) {
            // If time passed today, assume tomorrow
            date.setDate(date.getDate() + 1);
        }
        scheduledDate = date;
        title = title.replace(timeMatch[0], '').trim();
    }

    return {
        title: title.replace(/\s+/g, ' ').trim(), // Clean up extra spaces
        category,
        effort,
        importance,
        duration,
        scheduledDate
    };
}
