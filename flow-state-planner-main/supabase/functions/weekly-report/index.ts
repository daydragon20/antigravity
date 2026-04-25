import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Niet ingelogd" }), { status: 401, headers: corsHeaders });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Ongeldig token" }), { status: 401, headers: corsHeaders });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [tasksRes, energyRes, profileRes] = await Promise.all([
      supabase.from("tasks").select("title,effort,importance,completed,created_at").eq("user_id", user.id).gte("created_at", sevenDaysAgo),
      supabase.from("energy_logs").select("energy,mood,timestamp").eq("user_id", user.id).gte("timestamp", sevenDaysAgo).order("timestamp", { ascending: true }),
      supabase.from("profiles").select("name").eq("user_id", user.id).single(),
    ]);

    const tasks = tasksRes.data || [];
    const energyLogs = energyRes.data || [];
    const name = profileRes.data?.name || "gebruiker";

    const completed = tasks.filter((t: any) => t.completed).length;
    const total = tasks.length;
    const avgEnergy = energyLogs.length
      ? (energyLogs.reduce((s: number, l: any) => s + l.energy, 0) / energyLogs.length).toFixed(1)
      : "?";
    const avgMood = energyLogs.length
      ? (energyLogs.reduce((s: number, l: any) => s + l.mood, 0) / energyLogs.length).toFixed(1)
      : "?";

    const highEnergyHours = energyLogs
      .filter((l: any) => l.energy >= 4)
      .map((l: any) => new Date(l.timestamp).getHours());
    const peakHour = highEnergyHours.length
      ? Math.round(highEnergyHours.reduce((a: number, b: number) => a + b, 0) / highEnergyHours.length)
      : null;

    const dataSummary = `
Naam: ${name}
Week: ${new Date(sevenDaysAgo).toLocaleDateString("nl-NL")} — ${new Date().toLocaleDateString("nl-NL")}
Taken: ${completed}/${total} voltooid (${total > 0 ? Math.round((completed / total) * 100) : 0}%)
Gemiddelde energie: ${avgEnergy}/5
Gemiddelde stemming: ${avgMood}/5
Piekuur energie: ${peakHour !== null ? `${peakHour}:00–${peakHour + 1}:00` : "onbekend"}
Hoge-prioriteit taken: ${tasks.filter((t: any) => t.importance >= 4).length}
    `.trim();

    const prompt = `Je bent een vriendelijke productiviteitscoach. Analyseer deze weekdata voor ${name} en schrijf een persoonlijk weekrapport in het Nederlands.

Data:
${dataSummary}

Schrijf 3–4 alinea's:
1. Positieve terugkoppeling op de week
2. Patronen die je ziet (energie, productiviteit)
3. Één concrete tip voor volgende week
4. Motiverende afsluiting

Schrijf in je-/jouw stijl, warm en persoonlijk. Geen opsommingen.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ report: "Weekrapport is niet beschikbaar. Stel LOVABLE_API_KEY in als Edge Function secret." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
      }),
    });

    if (!aiResp.ok) throw new Error(`AI API: ${aiResp.status}`);
    const aiData = await aiResp.json();
    const report = aiData.choices?.[0]?.message?.content || "Rapport kon niet worden gegenereerd.";

    // Cache in chat_messages with special role
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "weekly_report", content: report });

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Intern serverfout" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
