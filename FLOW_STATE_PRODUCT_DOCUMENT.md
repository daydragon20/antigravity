# Flow State — Product Document

> Versie 1.0 | April 2026

---

## Wat is Flow State?

Flow State is een **AI-gestuurde life operating system** dat al jouw data samenbrengt, begrijpt en omzet in concrete actie.

**Het doel:**
Chaos in je hoofd → duidelijke acties op het juiste moment

Voor mensen die:
- te veel ideeën hebben
- te weinig tijd hebben
- en niet weten waar ze moeten beginnen

---

## De kern van het product (de 3 pijlers)

### 1. Het verzamelt jouw realiteit — niet alleen je taken

Via integraties ziet de AI:
- **Wat je gepland hebt** → Google Calendar / Outlook
- **Wat je denkt en wil** → Audiocap / spraak input
- **Hoe je je voelt** → Garmin / Fitbit (energie, slaap, stress)

Dit is al 10x krachtiger dan elke klassieke app.

### 2. Het begrijpt wie je bent en hoe je leeft

De AI bouwt een persoonlijk profiel:
- Jouw ritme (wanneer heb je focus? wanneer ben je moe?)
- Jouw gedrag (wat stel je uit? wat werkt voor jou?)
- Jouw valkuilen

Dit is de "moat" — wat anderen moeilijk kunnen kopiëren.

### 3. Het zet alles om in actie

Alle input → automatisch:
- Opgesplitst in concrete taken
- Ingepland op realistische momenten
- Aangepast aan je energie

**Voorbeeld:**
> Je hebt school, een business idee, en weinig slaap.
> Flow State zegt niet: "hier is je lijst"
> Maar: **"Vandaag om 17:30 doe je 1 simpele outreach, want je energie is laag."**

---

## User Flow (hoe de app concreet werkt)

| Stap | Wat gebeurt er |
|------|----------------|
| **1. Input** | Gebruiker spreekt ideeën in, heeft agenda gekoppeld, draagt wearable |
| **2. AI analyse** | Combineert Tijd (agenda) + Energie (wearable) + Intentie (spraak) |
| **3. Structuur** | AI maakt projecten, subtaken, prioriteiten |
| **4. Dagelijkse begeleiding** | Gebruiker ziet wat hij NÚ moet doen, waarom, aangepast aan energie |
| **5. Feedback loop** | App leert wat je uitstelt, wanneer je productief bent, wat werkt |

---

## Wat maakt Flow State uniek

| Andere apps | Flow State |
|-------------|------------|
| Slaan dingen op | Denkt voor de gebruiker |
| Zijn statisch | Past zich realtime aan (energie + agenda) |
| Geven lijsten | Geeft beslissingen |

**Je verkoopt geen app. Je verkoopt: mentale rust, duidelijkheid, uitvoering.**

---

## Wat is al gebouwd ✅

### Authenticatie & gebruikersbeheer
- E-mail/wachtwoord login en registratie
- Sessiebeheer via Supabase
- Auto token refresh en sessiepersistentie

### Gebruikersprofiel & instellingen
- Naam, waak-/slaaptijden, maaltijdtijden, snakmomenten
- Werktijden, maximale taken per blok, pauzeduur, bewegingsinterval
- Thema-voorkeur, notificatie-instellingen

### Taakbeheer
- Taken aanmaken met titel, beschrijving, moeite, belang, duur, deadline
- Taken bewerken, verwijderen, voltooien
- Categorieën: werk, gezondheid, creatief, sociaal, admin, overig
- Filter op status (actief / voltooid / alles)

### Energiebeheer & logging
- Energie loggen (schaal 1–5)
- Stemming loggen (schaal 1–5)
- Historische energielogs met tijdstempels
- Energieanalyse per dagdeel (ochtend, middag, avond)
- Visuele indicators (emoji-gebaseerd)
- Energie-curve grafiek

### Dagelijkse tijdlijn
- Visueel tijdlijn van 6:00–23:00
- Realtime tijdindicator
- Kleurgecodeerde blokken: taken, maaltijden, beweging, rust, vrij
- Framer Motion animaties

### Gezondheidsherinneringen
- Maaltijd-, bewegings- en rustreminders
- Aanmaken, voltooien, verwijderen
- Weergave op homepagina

### Notificaties
- Browser-notificatie API
- Configureerbaar per type: taken, maaltijden, beweging, rust, energie check-ins
- Geluid en trillen ondersteuning

### AI Energie Coach
- Chatinterface met gespreksgeschiedenis
- Contextbewust: naam, energie/stemming, recente logs, activiteitendatabase
- AI-model: Google Gemini Flash (via Lovable API)
- Snelle prompt-suggesties (energie verhogen, ontspannen, creatief, etc.)
- Chatgeschiedenis opgeslagen in Supabase
- Volledig in het Nederlands
- Markdown-ondersteuning in antwoorden

### Inzichten & analyses
- Taakvoltooisingspercentage
- Totale productieve tijd (uren:minuten)
- Gemiddeld energie- en stemmingsniveau
- Energiepatronen per dagdeel

### Activiteitendatabase
- 40+ voorgeseede activiteiten
- Categorieën: energie-boost, rust, mentale stimulatie, lichamelijke gezondheid, etc.
- Activiteiten loggen met voor/na energie-effect
- Gebruiker kan eigen activiteiten toevoegen

### Weeksoverzicht & dashboard
- Begroeting op basis van tijdstip
- Komende 3 taken
- Wekelijks overzicht

### Database (Supabase — volledig geconfigureerd) ✅

| Tabel | Inhoud |
|-------|--------|
| `profiles` | Gebruikersvoorkeuren en instellingen |
| `tasks` | Taken met effort, belang, deadlines |
| `energy_logs` | Energie- en stemmingslogs |
| `health_reminders` | Maaltijd/beweging/rust reminders |
| `activities` | Globale + persoonlijke activiteiten |
| `activity_logs` | Activiteitsgeschiedenis met energie-effecten |
| `chat_messages` | AI coach gespreksgeschiedenis |

---

## Wat gedeeltelijk klaar is ⚠️

### Google Calendar — code klaar, OAuth nog niet geconfigureerd
- Hook `useGoogleCalendar.ts` is volledig gebouwd
- Haalt events op uit alle agenda's, converteert naar TimeBlock-formaat (7 dagen venster)
- **Ontbreekt:** Google OAuth provider instellen in Supabase + frontend sign-in flow

### Outlook Calendar — code klaar, OAuth nog niet geconfigureerd
- Hook `useOutlookCalendar.ts` is volledig gebouwd, zelfde logica als Google Calendar
- **Ontbreekt:** Microsoft OAuth provider instellen in Supabase + frontend sign-in flow

### Agenda-synchronisatie naar taken
- `useCalendarSync.ts` gebouwd: detecteert vergaderingen, maaltijden, wandelingen via keywords
- AI-verfijning van effort/belang op basis van eventnaam
- **Ontbreekt:** werkt pas volledig na OAuth-configuratie

### Slimme taakparser — basis aanwezig
- Categorieën (`#werk`, `#gezondheid`), belang (`!belangrijk`), moeite (`~laag`), tijden (`om 14:00`, `1h`)
- **Ontbreekt:** natuurlijke taal ("morgen", "volgende week maandag"), herhalingspatronen

---

## Wat nog volledig ontbreekt ❌

### Wearable integraties
- Garmin — ❌
- Fitbit — ❌
- Oura Ring — ❌
- Apple Health — ❌
- Samsung Health — ❌
- **Impact:** energie/slaap data moet handmatig worden ingevoerd

### Spraak / stem input
- Geen voice-to-text voor taakcreatie
- Geen spraakopdrachten
- Geen audioscriptie
- **Impact:** alles moet getypt worden

### Automatische taakplanning op basis van energie
- Geen algoritme dat taken automatisch inplant op optimale momenten
- Gebruiker moet alles handmatig plannen

### Terugkerende taken
- Geen dagelijkse/wekelijkse/maandelijkse herhaling
- Elke taak is eenmalig

### Push notificaties (mobiel)
- Alleen browser-notificaties (werken niet als browser dicht is)
- Geen Firebase Cloud Messaging, geen OneSignal
- **Impact:** reminders werken alleen als de app open is

### Geavanceerde AI-functies
- Geen voorspellend energiemodel
- Geen circadiaans ritme-analyse
- Geen correlatie-analyse (energie vs. prestaties)
- Geen prompt caching voor betere prestaties

### Offline functionaliteit
- Geen service worker
- Geen offline taakwachtrij
- Vereist altijd internetverbinding

### Data export / import
- Geen CSV, JSON, PDF of ICS export
- Geen import vanuit andere apps (Todoist, Notion, etc.)

### Gewoontebeheer (habit tracking)
- Geen habit tracking
- Geen streaks
- Geen habit-specifieke herinneringen

### Samenwerking
- Alleen single-user
- Geen gedeelde taken of agenda's

---

## Huidige integratiestatus — overzicht

| Integratie | Status | Opmerking |
|------------|--------|-----------|
| Supabase (database + auth) | ✅ Volledig werkend | Alle tabellen aanwezig |
| Browser notificaties | ✅ Werkend | Alleen als app open is |
| Google Gemini AI (coach) | ✅ Werkend | Via Lovable API |
| Google Calendar | ⚠️ Code klaar | OAuth config nodig in Supabase |
| Outlook Calendar | ⚠️ Code klaar | OAuth config nodig in Supabase |
| Garmin | ❌ Niet gebouwd | |
| Fitbit | ❌ Niet gebouwd | |
| Spraak / audio input | ❌ Niet gebouwd | |
| Push notificaties (mobiel) | ❌ Niet gebouwd | |
| Data export | ❌ Niet gebouwd | |

---

## Risico's en uitdagingen

### 1. Te complex in het begin
Als je alles tegelijk bouwt (agenda + wearable + AI + spraak) → bouw je niets af.

**Aanbeveling:** Start met spraak → taken → simpele planning. Dan pas uitbreiden.

### 2. Privacy & vertrouwen
Je vraagt agenda-data, energiedata, gedragsdata. Dat is veel.

**Verplicht:** kristalheldere uitleg "wat doen we met jouw data?" vóór elke integratie.

### 3. AI-kwaliteit is alles
Als de AI slechte suggesties geeft → vertrouwen verdwenen.

Investeer vroeg in goede prompts en een sterke feedback-loop.

---

## Prioriteiten & roadmap

### Nu direct (MVP afronden)
1. Google OAuth instellen in Supabase → Google Calendar koppelen
2. Microsoft OAuth instellen in Supabase → Outlook koppelen
3. Automatische taakplanning op basis van energieniveau bouwen
4. Terugkerende taken toevoegen

### Daarna (product onderscheiden)
1. Spraak-input voor snelle taakcreatie
2. Fitbit of Garmin integratie
3. Push notificaties via Firebase
4. Geavanceerde AI-analyse (circadiaans ritme, voorspellende planning)

### Uiteindelijk doel
Geen app met features — maar een persoonlijke AI die voor je **denkt**, **plant** en **bijstuurt** op basis van wie jij bent en hoe jij functioneert.

---

*Flow State Product Document v1.0 — gegenereerd op 25 april 2026*
