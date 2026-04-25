import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { messages } = await req.json();

    // Fetch context: activities, user energy logs, activity history, profile
    const [activitiesRes, energyLogsRes, activityLogsRes, profileRes] = await Promise.all([
      supabase.from("activities").select("*").or(`is_global.eq.true,created_by.eq.${user.id}`),
      supabase.from("energy_logs").select("*").eq("user_id", user.id).order("timestamp", { ascending: false }).limit(10),
      supabase.from("activity_logs").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(20),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    ]);

    const activities = activitiesRes.data || [];
    const energyLogs = energyLogsRes.data || [];
    const activityLogs = activityLogsRes.data || [];
    const profile = profileRes.data;

    const latestEnergy = energyLogs[0];
    const hour = new Date().getHours();

    // Build activity context
    const activityCategories = activities.reduce((acc: Record<string, any[]>, a: any) => {
      acc[a.category] = acc[a.category] || [];
      acc[a.category].push({ name: a.name, description: a.description, effort: a.effort, duration: a.duration, effects: a.effects, location: a.location, materials: a.materials });
      return acc;
    }, {});

    // Recent activity history for personalization
    const recentActivities = activityLogs.map((l: any) => ({
      name: l.activity_name,
      energyBefore: l.energy_before,
      energyAfter: l.energy_after,
      rating: l.rating,
      date: l.completed_at,
    }));

    const systemPrompt = `Je bent EnergieCoach, een vriendelijke en empathische AI-coach gespecialiseerd in energie-management, welzijn en productiviteit. Je bent onderdeel van de EnergiePlanner app.

BELANGRIJK: Je spreekt altijd Nederlands. Je bent warm, behulpzaam en moedigt de gebruiker aan.

CONTEXT OVER DE GEBRUIKER:
- Naam: ${profile?.name || "onbekend"}
- Huidig energieniveau: ${latestEnergy ? `${latestEnergy.energy}/5` : "onbekend"}
- Huidige stemming: ${latestEnergy ? `${latestEnergy.mood}/5` : "onbekend"}
- Tijd van de dag: ${hour}:00
- Recente energiegeschiedenis: ${energyLogs.slice(0, 5).map((l: any) => `${new Date(l.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}: energie ${l.energy}/5, stemming ${l.mood}/5`).join("; ")}

BESCHIKBARE ACTIVITEITEN DATABASE:
${Object.entries(activityCategories).map(([cat, acts]) => `\n## ${cat}\n${(acts as any[]).map((a: any) => `- ${a.name} (${a.effort}, ${a.duration}min, effecten: ${a.effects?.join(", ")}, locatie: ${a.location}${a.materials ? `, materialen: ${a.materials}` : ""}): ${a.description}`).join("\n")}`).join("\n")}

RECENTE ACTIVITEITEN VAN DE GEBRUIKER:
${recentActivities.length > 0 ? recentActivities.map((a: any) => `- ${a.name}: energie ${a.energyBefore}→${a.energyAfter}, beoordeling: ${a.rating || "n.v.t."}`).join("\n") : "Nog geen activiteiten gedaan."}

INSTRUCTIES:
1. Als de gebruiker vraagt om een activiteit of suggestie, kies de BESTE activiteit uit de database op basis van:
   - Hun huidige energieniveau (laag energie → ontspanning/lichte boost; hoog → uitdaging/productief)
   - Tijd van de dag (ochtend → energieboost; middag → focus; avond → ontspanning)
   - Eerdere activiteiten en hun effect (vermijd herhaling, kies wat eerder goed werkte)
   - Beschikbare tijd en locatie indien bekend
2. Geef altijd concrete, specifieke suggesties met naam, beschrijving en waarom het past
3. Geef een "prioriteitsscore" (1-10) bij elke suggestie gebaseerd op de situatie
4. Als de gebruiker iets wil toevoegen aan de database, help ze met alle velden
5. Houd het kort en actionable - geen lange verhalen
6. Gebruik emoji's spaarzaam maar effectief
7. Als de energie laag is, wees extra empathisch en stel zachte activiteiten voor`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Te veel verzoeken, probeer het later opnieuw." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Groq-tegoed is op. Controleer je Groq account." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI-fout opgetreden" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("energy-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Onbekende fout" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
