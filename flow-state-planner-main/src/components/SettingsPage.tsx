import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  User,
  Bell,
  Clock,
  Utensils,
  Moon,
  Sun,
  Dumbbell,
  Shield,
  Info,
  ChevronRight,
  Smartphone,
  Volume2,
  Vibrate,
  LogOut,
  Trash2,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNotifications } from "@/hooks/useNotifications";
import type { UserPreferences } from "@/types";
import { defaultPreferences } from "@/types";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onSignOut?: () => Promise<void>;
}

type SettingsSection = 'main' | 'profile' | 'notifications' | 'schedule' | 'meals' | 'about';

export function SettingsPage({ preferences, onUpdatePreferences, onSignOut }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const { permission, settings, requestPermission, updateSettings, isSupported } = useNotifications();

  const goBack = () => setActiveSection('main');

  const menuItems = [
    { id: 'profile' as const, icon: User, label: 'Profiel', description: 'Naam en persoonlijke info' },
    { id: 'notifications' as const, icon: Bell, label: 'Meldingen', description: permission === 'granted' ? 'Ingeschakeld' : 'Uitgeschakeld' },
    { id: 'schedule' as const, icon: Clock, label: 'Schema', description: 'Werk- en rusttijden' },
    { id: 'meals' as const, icon: Utensils, label: 'Maaltijden', description: 'Eet- en snacktijden' },
    { id: 'about' as const, icon: Info, label: 'Over de app', description: 'Versie 1.0.0' },
  ];

  if (activeSection !== 'main') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="min-h-screen bg-background"
      >
        {/* Section Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button onClick={goBack} className="p-2 -ml-2 hover:bg-secondary rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">
              {activeSection === 'profile' && 'Profiel'}
              {activeSection === 'notifications' && 'Meldingen'}
              {activeSection === 'schedule' && 'Schema'}
              {activeSection === 'meals' && 'Maaltijden'}
              {activeSection === 'about' && 'Over de app'}
            </h1>
          </div>
        </header>

        <div className="px-6 py-6 max-w-lg mx-auto">
          {activeSection === 'profile' && (
            <ProfileSection 
              preferences={preferences} 
              onUpdate={onUpdatePreferences} 
            />
          )}
          {activeSection === 'notifications' && (
            <NotificationsSection 
              settings={settings}
              permission={permission}
              onRequestPermission={requestPermission}
              onUpdateSettings={updateSettings}
              isSupported={isSupported}
            />
          )}
          {activeSection === 'schedule' && (
            <ScheduleSection 
              preferences={preferences} 
              onUpdate={onUpdatePreferences} 
            />
          )}
          {activeSection === 'meals' && (
            <MealsSection 
              preferences={preferences} 
              onUpdate={onUpdatePreferences} 
            />
          )}
          {activeSection === 'about' && <AboutSection />}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-8 pb-28 px-6"
    >
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Instellingen</h1>
        <p className="text-muted-foreground mb-6">Pas de app aan naar jouw voorkeuren</p>

        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
                className="p-4 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer"
                onClick={() => setActiveSection(item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            );
          })}
        </div>

        <Separator className="my-8" />

        {onSignOut && (
          <Card 
            className="p-4 shadow-card cursor-pointer hover:shadow-elevated transition-all mb-4"
            onClick={onSignOut}
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <LogOut className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Uitloggen</h3>
                <p className="text-sm text-muted-foreground">Afmelden van je account</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 shadow-card border-destructive/20">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-destructive/10 rounded-xl">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Gegevens wissen</h3>
              <p className="text-sm text-muted-foreground">Alle taken en logs verwijderen</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function ProfileSection({ preferences, onUpdate }: { 
  preferences: UserPreferences; 
  onUpdate: (updates: Partial<UserPreferences>) => void;
}) {
  const [name, setName] = useState(preferences.name);

  const handleSave = () => {
    onUpdate({ name });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{preferences.name || 'Gebruiker'}</h3>
            <p className="text-sm text-muted-foreground">Persoonlijk profiel</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naam</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jouw naam"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Opslaan
          </Button>
        </div>
      </Card>
    </div>
  );
}

function NotificationsSection({ 
  settings, 
  permission, 
  onRequestPermission, 
  onUpdateSettings,
  isSupported 
}: {
  settings: any;
  permission: NotificationPermission;
  onRequestPermission: () => Promise<boolean>;
  onUpdateSettings: (updates: any) => void;
  isSupported: boolean;
}) {
  if (!isSupported) {
    return (
      <Card className="p-6 shadow-card">
        <div className="text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Niet ondersteund</h3>
          <p className="text-sm text-muted-foreground">
            Je browser ondersteunt geen push notificaties.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Card */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              permission === 'granted' ? "bg-energy-high/20" : "bg-muted"
            )}>
              <Bell className={cn(
                "w-5 h-5",
                permission === 'granted' ? "text-energy-high" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h3 className="font-medium">Meldingen</h3>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' ? 'Ingeschakeld' : permission === 'denied' ? 'Geweigerd' : 'Uitgeschakeld'}
              </p>
            </div>
          </div>
          {permission !== 'granted' && (
            <Button onClick={onRequestPermission} size="sm">
              Inschakelen
            </Button>
          )}
          {permission === 'granted' && (
            <Check className="w-5 h-5 text-energy-high" />
          )}
        </div>

        {permission === 'denied' && (
          <p className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-lg">
            Je hebt meldingen geweigerd. Ga naar je browserinstellingen om dit te wijzigen.
          </p>
        )}
      </Card>

      {/* Notification Types */}
      {permission === 'granted' && (
        <>
          <Card className="p-6 shadow-card">
            <h3 className="font-semibold mb-4">Meldingstypen</h3>
            <div className="space-y-4">
              <SettingToggle
                icon={Clock}
                label="Taakherinneringen"
                description="Herinner me aan geplande taken"
                checked={settings.taskReminders}
                onCheckedChange={(checked) => onUpdateSettings({ taskReminders: checked })}
              />
              <Separator />
              <SettingToggle
                icon={Utensils}
                label="Maaltijdherinneringen"
                description="Eet- en snackmeldingen"
                checked={settings.mealReminders}
                onCheckedChange={(checked) => onUpdateSettings({ mealReminders: checked })}
              />
              <Separator />
              <SettingToggle
                icon={Dumbbell}
                label="Bewegingsherinneringen"
                description="Tijd voor stretching of wandelen"
                checked={settings.movementReminders}
                onCheckedChange={(checked) => onUpdateSettings({ movementReminders: checked })}
              />
              <Separator />
              <SettingToggle
                icon={Moon}
                label="Rustherinneringen"
                description="Pauze en mindfulness meldingen"
                checked={settings.restReminders}
                onCheckedChange={(checked) => onUpdateSettings({ restReminders: checked })}
              />
              <Separator />
              <SettingToggle
                icon={Sun}
                label="Energie check-ins"
                description="Vraag naar je energieniveau"
                checked={settings.energyCheckIns}
                onCheckedChange={(checked) => onUpdateSettings({ energyCheckIns: checked })}
              />
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="font-semibold mb-4">Geluid & Trillingen</h3>
            <div className="space-y-4">
              <SettingToggle
                icon={Volume2}
                label="Geluid"
                description="Speel geluid af bij meldingen"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => onUpdateSettings({ soundEnabled: checked })}
              />
              <Separator />
              <SettingToggle
                icon={Vibrate}
                label="Trillen"
                description="Trillen bij meldingen"
                checked={settings.vibrationEnabled}
                onCheckedChange={(checked) => onUpdateSettings({ vibrationEnabled: checked })}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function ScheduleSection({ preferences, onUpdate }: { 
  preferences: UserPreferences; 
  onUpdate: (updates: Partial<UserPreferences>) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-accent" />
          Dagritme
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wakeTime">Opstaan</Label>
              <Input
                id="wakeTime"
                type="time"
                value={preferences.wakeTime}
                onChange={(e) => onUpdate({ wakeTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleepTime">Slapen</Label>
              <Input
                id="sleepTime"
                type="time"
                value={preferences.sleepTime}
                onChange={(e) => onUpdate({ sleepTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Werktijden
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workStart">Start</Label>
              <Input
                id="workStart"
                type="time"
                value={preferences.workStartTime}
                onChange={(e) => onUpdate({ workStartTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEnd">Einde</Label>
              <Input
                id="workEnd"
                type="time"
                value={preferences.workEndTime}
                onChange={(e) => onUpdate({ workEndTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-activity-movement" />
          Pauzes
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pauzeduur (minuten)</Label>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdate({ breakDuration: mins })}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-medium text-sm transition-all",
                    preferences.breakDuration === mins
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bewegingsinterval (minuten)</Label>
            <div className="flex gap-2">
              {[60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdate({ movementInterval: mins })}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-medium text-sm transition-all",
                    preferences.movementInterval === mins
                      ? "bg-activity-movement text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MealsSection({ preferences, onUpdate }: { 
  preferences: UserPreferences; 
  onUpdate: (updates: Partial<UserPreferences>) => void;
}) {
  const updateMealTime = (meal: 'breakfast' | 'lunch' | 'dinner', time: string) => {
    onUpdate({
      mealTimes: { ...preferences.mealTimes, [meal]: time }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-activity-meal" />
          Maaltijden
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="breakfast">Ontbijt</Label>
            <Input
              id="breakfast"
              type="time"
              value={preferences.mealTimes.breakfast}
              onChange={(e) => updateMealTime('breakfast', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lunch">Lunch</Label>
            <Input
              id="lunch"
              type="time"
              value={preferences.mealTimes.lunch}
              onChange={(e) => updateMealTime('lunch', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dinner">Avondeten</Label>
            <Input
              id="dinner"
              type="time"
              value={preferences.mealTimes.dinner}
              onChange={(e) => updateMealTime('dinner', e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <h3 className="font-semibold mb-4">Snacks</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Voeg tussendoortjes toe om herinnerd te worden aan gezonde snacks.
        </p>
        <div className="space-y-3">
          {preferences.snackTimes.map((time, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="time"
                value={time}
                onChange={(e) => {
                  const newTimes = [...preferences.snackTimes];
                  newTimes[index] = e.target.value;
                  onUpdate({ snackTimes: newTimes });
                }}
              />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  const newTimes = preferences.snackTimes.filter((_, i) => i !== index);
                  onUpdate({ snackTimes: newTimes });
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              onUpdate({ snackTimes: [...preferences.snackTimes, '15:00'] });
            }}
          >
            + Snacktijd toevoegen
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-energy-high mx-auto mb-4 flex items-center justify-center">
          <Sun className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">EnergiePlanner</h2>
        <p className="text-muted-foreground mb-4">Versie 1.0.0</p>
        <p className="text-sm text-muted-foreground">
          Plan je dag op basis van energie en welzijn, niet alleen deadlines.
        </p>
      </Card>

      <Card className="p-6 shadow-card">
        <h3 className="font-semibold mb-4">Functies</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Energie-gebaseerde taakplanning
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Gezondheidsherinneringen
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Stemming & energie tracking
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Slimme dagplanning
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            AI-gedreven inzichten
          </li>
        </ul>
      </Card>
    </div>
  );
}

function SettingToggle({ 
  icon: Icon, 
  label, 
  description, 
  checked, 
  onCheckedChange 
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
