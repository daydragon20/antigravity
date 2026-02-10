import { UserPreferences } from "@/types";

interface CoachContext {
    timeOfDay: string; // 'morning', 'afternoon', 'evening', 'night'
    energyLevel?: number; // 1-10 (optional, if we had it)
}

export function getCoachResponse(input: string, context?: CoachContext): { text: string; action?: string } {
    const lowerInput = input.toLowerCase();

    // 1. Check for specific keywords
    if (lowerInput.includes("moe") || lowerInput.includes("tired") || lowerInput.includes("sleepy") || lowerInput.includes("slaap")) {
        return {
            text: "Het klinkt alsof je wat rust kunt gebruiken. 🌙\n\n**Mijn advies:**\n*   Neem een korte powernap (20 min) als het nog vroeg is.\n*   Doe een 'Non-Sleep Deep Rest' (NSDR) sessie.\n*   Drink een glas water en strek even je benen.",
            action: "rust"
        };
    }

    if (lowerInput.includes("druk") || lowerInput.includes("stress") || lowerInput.includes("busy") || lowerInput.includes("paniek")) {
        return {
            text: "Adem even diep in... en uit. 🧘‍♂️\n\nAls je veel te doen hebt, helpt het om overzicht te creëren:\n1.  Schrijf alles op wat in je hoofd zit (Braindump).\n2.  Kies **één** belangrijk ding om nu te doen.\n3.  Zet een timer voor 25 minuten (Pomodoro).",
            action: "focus"
        };
    }

    if (lowerInput.includes("verveel") || lowerInput.includes("bored") || lowerInput.includes("saai")) {
        return {
            text: "Verveling is een teken dat je hersenen prikkels zoeken! 🧠\n\n**Ideeën:**\n*   Leer iets nieuws (duolingo, artikel lezen).\n*   Ruim je werkplek op (geeft direct voldoening).\n*   Ga een stukje wandelen zonder telefoon.",
            action: "lezen"
        };
    }

    if (lowerInput.includes("focus") || lowerInput.includes("concentratie") || lowerInput.includes("werk")) {
        return {
            text: "Klaar om te knallen? 🚀\n\nVoor diepe focus:\n*   Zet je telefoon op 'Niet storen'.\n*   Zet rustige achtergrondmuziek op (binaural beats).\n*   Begin met de moeilijkste taak (Eat the frog).",
            action: "werk"
        };
    }

    if (lowerInput.includes("energie") || lowerInput.includes("energy") || lowerInput.includes("power")) {
        return {
            text: "Wil je je energie verbeteren? ⚡\n\n*   **Beweging:** Doe 10 jumping jacks of loop de trap op en neer.\n*   **Licht:** Ga naar buiten voor daglicht.\n*   **Voeding:** Eet iets met eiwitten in plaats van suiker.",
            action: "beweging"
        };
    }

    // 2. Fallback based on time of day
    const hour = new Date().getHours();
    if (hour < 11) {
        return {
            text: "Goedemorgen! ☀️\nDit is vaak het beste moment voor 'Deep Work'. Heb je je belangrijkste taak voor vandaag al gekozen?",
        };
    } else if (hour < 14) {
        return {
            text: "Rond lunchtijd kan je energie wat dippen. 🥪\nVergeet niet even weg te stappen van je scherm.",
        };
    } else if (hour < 18) {
        return {
            text: "De middag is goed voor creatief werk of meetings. 🎨\nAls je inkakt, maak dan even een korte wandeling.",
        };
    } else {
        return {
            text: "De avond is om af te schakelen. 🌙\nProbeer schermen te vermijden in het laatste uur voor je gaat slapen.",
        };
    }
}

export function getDailyInsight(energy: number, mood: number, taskCount: number): string {
    // High Energy
    if (energy >= 4) {
        if (taskCount > 5) return "Je energie is top! 🚀 Een perfect moment om die ene lastige taak aan te pakken. Je lijst is lang, maar jij kunt dit.";
        if (taskCount > 0) return "Je hebt superveel energie en weinig taken. Misschien alvast vooruit werken of iets nieuws leren? 🎓";
        return "Energie te over! Ga lekker sporten of doe iets sociaals. 🏃‍♂️";
    }

    // Medium Energy
    if (energy === 3) {
        if (taskCount > 5) return "Gemiddelde energie vandaag. Focus op wat écht moet en laat de rest even liggen. ⚖️";
        return "Je energie is stabiel. Prima dag om wat routineklusjes weg te werken. 📋";
    }

    // Low Energy
    if (energy <= 2) {
        if (mood <= 2) return "Het zit even tegen vandaag. Wees lief voor jezelf. Doe alleen het hoogstnoodzakelijke. 🛋️";
        return "Energie is laag, maar je humeur is oké. Doe rustig aan en neem vaker pauze. ☕";
    }

    return "Luister naar je lichaam vandaag. Jij weet het beste wat je nodig hebt. ✨";
}
