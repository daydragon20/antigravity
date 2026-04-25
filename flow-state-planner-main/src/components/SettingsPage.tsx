import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Bell, Clock, Utensils, Info, ChevronRight,
  LogOut, Download, Sparkles, Watch, Calendar, Sun, Moon, Dumbbell,
  Volume2, Vibrate, Check, Trash2, Plus, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { WearableConnectionCard } from "@/components/WearableConnectionCard";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useEnergyLogs } from "@/hooks/useEnergyLogs";
import { useTasks } from "@/hooks/useTasks";
import { exportTasksCSV, exportDataJSON, exportTasksICS, downloadFile } from "@/lib/exportUtils";
import type { UserPreferences } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onSignOut?: () => Promise<void>;
}

type Section =
  | "main" | "profile" | "notifications" | "schedule" | "meals"
  | "integrations" | "wearables" | "export" | "about";

interface MenuItem {
  id: Section;
  icon: React.ElementType;
  label: string;
  description: string;
  badge?: string;
  iconBg?: string;
}

export function SettingsPage({ preferences, onUpdatePreferences, onSignOut }: SettingsPageProps) {
  const [section, setSection] = useState<Section>("main");
  const { permission, settings, requestPermission, updateSettings, isSupported } = useNotifications();
  const { user } = useAuth();
  const { energyLogs } = useEnergyLogs();
  const { tasks } = useTasks();

  const groups: { title: string; items: MenuItem[] }[] = [
    {
      title: "Account",
      items: [
        { id: "profile", icon: User, label: "Profiel", description: preferences.name || "Stel je naam in", iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      ],
    },
    {
      title: "Persoonlijk",
      items: [
        { id: "schedule", icon: Clock, label: "Schema", description: `Werktijd ${preferences.workStartTime}–${preferences.workEndTime}`, iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
        { id: "meals", icon: Utensils, label: "Maaltijden", description: "Eet- en snacktijden", iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
        { id: "notifications", icon: Bell, label: "Meldingen", description: permission === "granted" ? "Ingeschakeld" : "Uitgeschakeld", iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
      ],
    },
    {
      title: "Koppelingen",
      items: [
        { id: "integrations", icon: Calendar, label: "Agenda's", description: "Google Calendar · Outlook", badge: "Configuratie nodig", iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
        { id: "wearables", icon: Watch, label: "Wearables", description: "Fitbit · Oura · Garmin", badge: "Binnenkort", iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
      ],
    },
    {
      title: "Data",
      items: [
        { id: "export", icon: Download, label: "Exporteren", description: "CSV, JSON of kalenderbestand", iconBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
        { id: "about", icon: Info, label: "Over Flow State", description: "Versie 1.0.0", iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
      ],
    },
  ];

  if (section !== "main") {
    const sectionTitle: Record<Section, string> = {
      main: "", profile: "Profiel", notifications: "Meldingen", schedule: "Schema",
      meals: "Maaltijden", integrations: "Agenda-koppelingen", wearables: "Wearables",
      export: "Exporteren", about: "Over Flow State",
    };

    return (
      <motion.div
        key={section}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        className="min-h-screen bg-background pb-28"
      >
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button onClick={() => setSection("main")} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold">{sectionTitle[section]}</h1>
          </div>
        </header>

        <div className="px-5 py-5 max-w-lg mx-auto">
          {section === "profile" && <ProfileSection preferences={preferences} onUpdate={onUpdatePreferences} />}
          {section === "notifications" && (
            <NotificationsSection
              settings={settings} permission={permission}
              onRequestPermission={requestPermission} onUpdateSettings={updateSettings} isSupported={isSupported}
            />
          )}
          {section === "schedule" && <ScheduleSection preferences={preferences} onUpdate={onUpdatePreferences} />}
          {section === "meals" && <MealsSection preferences={preferences} onUpdate={onUpdatePreferences} />}
          {section === "integrations" && <IntegrationsSection />}
          {section === "wearables" && <WearablesSection />}
          {section === "export" && <ExportSection tasks={tasks} energyLogs={energyLogs} />}
          {section === "about" && <AboutSection />}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="px-5 pt-14 pb-5">
        <div className="max-w-lg mx-auto">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-card border border-border shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
              {preferences.name ? preferences.name[0].toUpperCase() : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-foreground truncate">{preferences.name || "Gebruiker"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={() => setSection("profile")}
              className="text-xs text-primary font-semibold px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Bewerk
            </button>
          </div>

          <h1 className="text-2xl font-bold text-foreground">Instellingen</h1>
        </div>
      </header>

      <main className="px-5 max-w-lg mx-auto space-y-6">
        {groups.map((group) => (
          <section key={group.title}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {group.title}
            </p>
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    {idx > 0 && <Separator />}
                    <button
                      onClick={() => setSection(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", item.iconBg)}>
                        <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Sign out */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Uitloggen</p>
              <p className="text-xs text-muted-foreground">Sessie beëindigen</p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">Flow State v1.0.0 · Gemaakt met ❤️</p>
      </main>
    </div>
  );
}

// ─── SUB-SECTIONS ───────────────────────────────────────────────────────────

function ProfileSection({ preferences, onUpdate }: { preferences: UserPreferences; onUpdate: (u: Partial<UserPreferences>) => void }) {
  const [name, setName] = useState(preferences.name);

  return (
    <div className="space-y-4">
      <SettingsGroup title="Naam">
        <div className="space-y-2">
          <Label className="text-sm">Hoe mag ik je noemen?</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jouw naam" className="rounded-xl h-12" />
          <Button onClick={() => onUpdate({ name })} className="w-full rounded-xl mt-2">Opslaan</Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Thema">
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onUpdate({ theme: t })}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                preferences.theme === t ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground"
              )}
            >
              {t === "light" ? <Sun className="w-3.5 h-3.5" /> : t === "dark" ? <Moon className="w-3.5 h-3.5" /> : <span>💻</span>}
              {t === "light" ? "Licht" : t === "dark" ? "Donker" : "Systeem"}
            </button>
          ))}
        </div>
      </SettingsGroup>
    </div>
  );
}

function NotificationsSection({ settings, permission, onRequestPermission, onUpdateSettings, isSupported }: {
  settings: any; permission: NotificationPermission;
  onRequestPermission: () => Promise<boolean>; onUpdateSettings: (u: any) => void; isSupported: boolean;
}) {
  if (!isSupported) {
    return (
      <SettingsGroup title="">
        <div className="text-center py-6">
          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Jouw browser ondersteunt geen meldingen.</p>
        </div>
      </SettingsGroup>
    );
  }

  return (
    <div className="space-y-4">
      <SettingsGroup title="Toestemming">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Browser meldingen</p>
            <p className="text-xs text-muted-foreground">{permission === "granted" ? "✅ Ingeschakeld" : permission === "denied" ? "❌ Geweigerd" : "Uitgeschakeld"}</p>
          </div>
          {permission !== "granted" && permission !== "denied" && (
            <Button size="sm" onClick={onRequestPermission} className="rounded-xl">Inschakelen</Button>
          )}
        </div>
      </SettingsGroup>

      {permission === "granted" && (
        <SettingsGroup title="Meldingstypen">
          {[
            { key: "taskReminders", label: "Taakherinneringen", desc: "Geplande taken" },
            { key: "mealReminders", label: "Maaltijden", desc: "Eet- & snackmeldingen" },
            { key: "movementReminders", label: "Beweging", desc: "Sta op en beweeg" },
            { key: "energyCheckIns", label: "Energie check-ins", desc: "Hoe voel je je?" },
          ].map((item, i) => (
            <div key={item.key}>
              {i > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={settings[item.key]} onCheckedChange={(c) => onUpdateSettings({ [item.key]: c })} />
              </div>
            </div>
          ))}
        </SettingsGroup>
      )}
    </div>
  );
}

function ScheduleSection({ preferences, onUpdate }: { preferences: UserPreferences; onUpdate: (u: Partial<UserPreferences>) => void }) {
  return (
    <div className="space-y-4">
      <SettingsGroup title="Dagritme">
        <div className="grid grid-cols-2 gap-3">
          <TimeField label="Opstaan" value={preferences.wakeTime} onChange={(v) => onUpdate({ wakeTime: v })} />
          <TimeField label="Slapen" value={preferences.sleepTime} onChange={(v) => onUpdate({ sleepTime: v })} />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Werktijden">
        <div className="grid grid-cols-2 gap-3">
          <TimeField label="Start" value={preferences.workStartTime} onChange={(v) => onUpdate({ workStartTime: v })} />
          <TimeField label="Einde" value={preferences.workEndTime} onChange={(v) => onUpdate({ workEndTime: v })} />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Pauzes">
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Pauzeduur (min)</Label>
          <div className="flex gap-2">
            {[5, 10, 15, 20, 30].map((m) => (
              <button key={m} onClick={() => onUpdate({ breakDuration: m })} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all", preferences.breakDuration === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                {m}
              </button>
            ))}
          </div>
          <Label className="text-xs text-muted-foreground">Bewegingsinterval (min)</Label>
          <div className="flex gap-2">
            {[60, 90, 120].map((m) => (
              <button key={m} onClick={() => onUpdate({ movementInterval: m })} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all", preferences.movementInterval === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </SettingsGroup>
    </div>
  );
}

function MealsSection({ preferences, onUpdate }: { preferences: UserPreferences; onUpdate: (u: Partial<UserPreferences>) => void }) {
  const setMeal = (k: "breakfast" | "lunch" | "dinner", v: string) =>
    onUpdate({ mealTimes: { ...preferences.mealTimes, [k]: v } });

  return (
    <div className="space-y-4">
      <SettingsGroup title="Maaltijden">
        <div className="space-y-3">
          <TimeField label="🥐 Ontbijt" value={preferences.mealTimes.breakfast} onChange={(v) => setMeal("breakfast", v)} />
          <TimeField label="🥗 Lunch" value={preferences.mealTimes.lunch} onChange={(v) => setMeal("lunch", v)} />
          <TimeField label="🍽️ Avondeten" value={preferences.mealTimes.dinner} onChange={(v) => setMeal("dinner", v)} />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Snacks">
        <div className="space-y-2">
          {preferences.snackTimes.map((t, i) => (
            <div key={i} className="flex gap-2">
              <Input type="time" value={t} onChange={(e) => {
                const n = [...preferences.snackTimes];
                n[i] = e.target.value;
                onUpdate({ snackTimes: n });
              }} className="flex-1 rounded-xl h-10" />
              <Button variant="ghost" size="icon" onClick={() => onUpdate({ snackTimes: preferences.snackTimes.filter((_, j) => j !== i) })} className="text-destructive hover:bg-destructive/10 rounded-xl">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => onUpdate({ snackTimes: [...preferences.snackTimes, "15:00"] })} className="w-full rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Snacktijd toevoegen
          </Button>
        </div>
      </SettingsGroup>
    </div>
  );
}

function IntegrationsSection() {
  const { session } = useAuth();
  const provider = (session as any)?.user?.app_metadata?.provider;
  const isGoogleConnected = provider === "google";
  const isOutlookConnected = provider === "azure";

  const connectGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
        redirectTo: window.location.origin,
      },
    });
  };

  const connectOutlook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "openid email profile Calendars.Read",
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-4">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚙️ Configuratie vereist</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
          Activeer Google en Microsoft OAuth in het Supabase dashboard voor je agenda's te koppelen.
        </p>
      </div>

      <SettingsGroup title="Agenda's">
        <CalendarCard
          icon="📅"
          name="Google Calendar"
          description="Synchroniseer je Google agenda-afspraken"
          connected={isGoogleConnected}
          onConnect={connectGoogle}
        />
        <Separator className="my-3" />
        <CalendarCard
          icon="📧"
          name="Outlook Calendar"
          description="Microsoft 365 en Outlook agenda's"
          connected={isOutlookConnected}
          onConnect={connectOutlook}
        />
      </SettingsGroup>

      <p className="text-xs text-muted-foreground text-center">
        Agenda-data wordt alleen lokaal gelezen. Nooit gedeeld of opgeslagen bij derden.
      </p>
    </div>
  );
}

function WearablesSection() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-4">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">🔜 Binnenkort beschikbaar</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
          Wearable-koppelingen zijn in ontwikkeling. Maak alvast een developer-account aan.
        </p>
      </div>

      <WearableConnectionCard provider="fitbit" connected={false} comingSoon />
      <WearableConnectionCard provider="oura" connected={false} comingSoon />
      <WearableConnectionCard provider="garmin" connected={false} comingSoon />
      <WearableConnectionCard provider="apple_health" connected={false} comingSoon />
      <WearableConnectionCard provider="samsung_health" connected={false} comingSoon />
    </div>
  );
}

function ExportSection({ tasks, energyLogs }: { tasks: any[]; energyLogs: any[] }) {
  const handleCSV = () => {
    downloadFile(exportTasksCSV(tasks), `flow-state-taken-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
    toast.success("CSV gedownload");
  };
  const handleJSON = () => {
    downloadFile(exportDataJSON(tasks, energyLogs), `flow-state-data-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
    toast.success("JSON gedownload");
  };
  const handleICS = () => {
    downloadFile(exportTasksICS(tasks), `flow-state-taken-${new Date().toISOString().slice(0, 10)}.ics`, "text/calendar");
    toast.success("ICS kalenderbestand gedownload");
  };

  return (
    <div className="space-y-4">
      <SettingsGroup title="Exporteer je data">
        <div className="space-y-2">
          <ExportButton onClick={handleCSV} icon="📊" label="Taken als CSV" desc="Open in Excel of Google Sheets" />
          <ExportButton onClick={handleJSON} icon="🗂️" label="Alles als JSON" desc="Taken, energie-logs, gewoonten" />
          <ExportButton onClick={handleICS} icon="📅" label="Kalenderbestand (.ics)" desc="Importeer in Apple Calendar / Google" />
        </div>
      </SettingsGroup>

      <p className="text-xs text-muted-foreground text-center">
        Jouw data blijft altijd van jou. Je kunt altijd exporteren.
      </p>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Flow State</h2>
        <p className="text-sm text-muted-foreground mt-1">Versie 1.0.0</p>
        <p className="text-xs text-muted-foreground mt-3 max-w-xs mx-auto">
          De enige planner die weet hoe laat je vergadering is én hoe moe je bent.
        </p>
      </div>

      <SettingsGroup title="Functies">
        {[
          "Energie-gebaseerde taakplanning",
          "AI Coach (Google Gemini)",
          "Brain Dump met spraak",
          "Pomodoro Focus Timer",
          "Gewoonten & streaks",
          "Google Calendar & Outlook sync",
          "Wearables (Fitbit, Oura, Garmin)",
        ].map((f) => (
          <div key={f} className="flex items-center gap-2 py-1">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground">{f}</span>
          </div>
        ))}
      </SettingsGroup>

      <SettingsGroup title="Juridisch">
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between text-sm text-foreground py-1">
            <span>Privacybeleid</span> <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <Separator />
          <button className="w-full flex items-center justify-between text-sm text-foreground py-1">
            <span>Servicevoorwaarden</span> <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </SettingsGroup>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type="time" value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl h-10" />
    </div>
  );
}

function CalendarCard({ icon, name, description, connected, onConnect }: {
  icon: string; name: string; description: string; connected: boolean; onConnect: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {connected ? (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ Verbonden</span>
      ) : (
        <Button size="sm" variant="outline" onClick={onConnect} className="rounded-xl text-xs h-8 border-primary/30 text-primary hover:bg-primary/5">
          Koppel
        </Button>
      )}
    </div>
  );
}

function ExportButton({ onClick, icon, label, desc }: { onClick: () => void; icon: string; label: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors text-left"
    >
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Download className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
    </button>
  );
}
