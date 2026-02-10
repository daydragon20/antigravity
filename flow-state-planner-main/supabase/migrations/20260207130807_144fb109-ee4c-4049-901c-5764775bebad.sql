
-- Activity categories enum
CREATE TYPE public.activity_category AS ENUM (
  'energy_boost',
  'rest_relaxation', 
  'mental_stimulation',
  'physical_health',
  'mental_wellbeing',
  'creativity',
  'social_interaction',
  'education',
  'self_reflection',
  'mini_challenge'
);

-- Effect types enum
CREATE TYPE public.activity_effect AS ENUM (
  'energy_boost',
  'relaxation',
  'focus',
  'mental_stimulation',
  'physical_improvement',
  'social_connection',
  'creativity',
  'learning'
);

-- Activity effort enum
CREATE TYPE public.activity_effort AS ENUM ('low', 'medium', 'high');

-- Activities table (global library)
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category activity_category NOT NULL,
  effort activity_effort NOT NULL DEFAULT 'medium',
  duration INTEGER NOT NULL DEFAULT 15,
  effects activity_effect[] NOT NULL DEFAULT '{}',
  location TEXT DEFAULT 'thuis',
  materials TEXT,
  is_global BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Everyone can read global activities, users can read their own custom ones
CREATE POLICY "Anyone can view global activities" ON public.activities
  FOR SELECT USING (is_global = true OR auth.uid() = created_by);

CREATE POLICY "Users can insert custom activities" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = created_by AND is_global = false);

-- Activity history / logs
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_id UUID REFERENCES public.activities(id),
  activity_name TEXT NOT NULL,
  energy_before INTEGER,
  energy_after INTEGER,
  mood_before INTEGER,
  mood_after INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs" ON public.activity_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed global activities
INSERT INTO public.activities (name, description, category, effort, duration, effects, location, materials) VALUES
-- Energieboost / fysieke energie
('Powerwalking', 'Ga 10 minuten stevig wandelen in de buitenlucht. Focus op je ademhaling en de omgeving.', 'energy_boost', 'medium', 10, '{energy_boost,physical_improvement}', 'buiten', NULL),
('Jumping jacks', 'Doe 3 sets van 20 jumping jacks met korte rustpauzes. Geweldige manier om snel je hartslag omhoog te krijgen.', 'energy_boost', 'high', 5, '{energy_boost,physical_improvement}', 'thuis', NULL),
('Danspauze', 'Zet je favoriete upbeat nummer op en dans 1 nummer lang voluit. Laat je gaan!', 'energy_boost', 'medium', 5, '{energy_boost,mental_stimulation}', 'thuis', 'Muziek/speaker'),
('Koude douche', 'Neem 30-60 seconden een koude douche of eindig je warme douche koud. Boost je alertheid enorm.', 'energy_boost', 'high', 5, '{energy_boost}', 'thuis', NULL),
('Trappenloop', 'Loop 5 keer de trap op en af. Simpel maar zeer effectief voor een energieboost.', 'energy_boost', 'high', 10, '{energy_boost,physical_improvement}', 'thuis', NULL),
('Ochtendstretching', 'Volg een korte stretchroutine: nek, schouders, rug, benen. Maak je lichaam wakker.', 'energy_boost', 'low', 10, '{energy_boost,relaxation}', 'thuis', 'Yogamat (optioneel)'),
('Fietstochtje', 'Maak een korte fietstocht door de buurt. Frisse lucht en beweging tegelijk.', 'energy_boost', 'medium', 30, '{energy_boost,physical_improvement}', 'buiten', 'Fiets'),
('HIIT mini-workout', 'Doe een korte HIIT-sessie: 30 sec squats, 30 sec burpees, 30 sec rust. Herhaal 4x.', 'energy_boost', 'high', 15, '{energy_boost,physical_improvement}', 'thuis', NULL),

-- Rust & ontspanning
('Box breathing', 'Adem 4 seconden in, houd 4 seconden vast, adem 4 seconden uit, houd 4 seconden vast. Herhaal 5 keer.', 'rest_relaxation', 'low', 5, '{relaxation}', 'overal', NULL),
('Body scan meditatie', 'Ga liggen en scan mentaal je lichaam van hoofd tot voeten. Merk spanning op en laat het los.', 'rest_relaxation', 'low', 15, '{relaxation,mental_stimulation}', 'thuis', NULL),
('Powernap', 'Stel een timer in op 20 minuten en doe een korte dutje. Niet langer, anders word je suf.', 'rest_relaxation', 'low', 20, '{relaxation,energy_boost}', 'thuis', NULL),
('Thee-ritueel', 'Zet bewust een kopje thee. Focus op het proces: water koken, thee trekken, ruiken, proeven.', 'rest_relaxation', 'low', 10, '{relaxation}', 'thuis', 'Thee'),
('Progressieve spierontspanning', 'Span elke spiergroep 5 sec aan en laat los. Begin bij je voeten en werk naar je hoofd.', 'rest_relaxation', 'low', 15, '{relaxation,physical_improvement}', 'thuis', NULL),
('Natuur luisteren', 'Ga naar buiten of open een raam. Sluit je ogen en luister 5 minuten naar natuurgeluiden.', 'rest_relaxation', 'low', 5, '{relaxation}', 'buiten', NULL),
('Warm bad nemen', 'Neem een warm bad met optioneel badzout of essentiële oliën. Laat alle spanning los.', 'rest_relaxation', 'low', 30, '{relaxation}', 'thuis', 'Bad, badzout (optioneel)'),
('Guided meditatie', 'Volg een begeleide meditatie via een app of YouTube. Kies een thema dat bij je past.', 'rest_relaxation', 'low', 15, '{relaxation,mental_stimulation}', 'thuis', 'Telefoon/koptelefoon'),

-- Mentale stimulatie
('Puzzel oplossen', 'Los een sudoku, kruiswoordpuzzel of logische puzzel op. Houdt je brein scherp.', 'mental_stimulation', 'low', 15, '{mental_stimulation,focus}', 'thuis', 'Puzzelboek of app'),
('Lees een artikel', 'Lees een interessant artikel over een onderwerp dat je boeit. Maak aantekeningen.', 'mental_stimulation', 'low', 15, '{mental_stimulation,learning}', 'overal', 'Telefoon/tablet'),
('Breinbreker', 'Probeer een breinbreker of riddle op te lossen. Daag jezelf uit om lateraal te denken.', 'mental_stimulation', 'medium', 10, '{mental_stimulation,focus}', 'overal', NULL),
('Podcast luisteren', 'Luister naar een educatieve of inspirerende podcast terwijl je iets anders doet.', 'mental_stimulation', 'low', 30, '{mental_stimulation,learning}', 'overal', 'Koptelefoon'),
('Geheugenspel', 'Speel een geheugenspel: onthoud 20 woorden in 2 minuten en schrijf ze daarna op.', 'mental_stimulation', 'medium', 10, '{mental_stimulation,focus}', 'thuis', 'Pen en papier'),
('Debatteer met jezelf', 'Kies een stelling en beargumenteer eerst vóór en dan tegen. Scherpt je kritisch denken.', 'mental_stimulation', 'medium', 15, '{mental_stimulation,creativity}', 'overal', NULL),

-- Lichaam & fysieke gezondheid
('Yogasessie', 'Volg een korte yogaflow: 5 zonnegroeten gevolgd door staande en zittende houdingen.', 'physical_health', 'medium', 30, '{physical_improvement,relaxation}', 'thuis', 'Yogamat'),
('Plankoefening', 'Houd een plank vast voor 30 seconden, rust 15 seconden. Herhaal 5 keer.', 'physical_health', 'high', 10, '{physical_improvement,energy_boost}', 'thuis', NULL),
('Wandeling 30 min', 'Maak een wandeling van 30 minuten. Varieer je tempo en geniet van de omgeving.', 'physical_health', 'medium', 30, '{physical_improvement,energy_boost,relaxation}', 'buiten', NULL),
('Stretching routine', 'Volledige body stretch: 30 sec per stretch, focus op stijve gebieden.', 'physical_health', 'low', 15, '{physical_improvement,relaxation}', 'thuis', NULL),
('Gezonde smoothie maken', 'Maak een voedzame smoothie met fruit, groenten en eiwitten.', 'physical_health', 'low', 10, '{physical_improvement,energy_boost}', 'thuis', 'Blender, fruit, groenten'),
('Buikspieroefeningen', 'Doe 3 sets van: 15 crunches, 10 leg raises, 30 sec bicycle crunches.', 'physical_health', 'high', 15, '{physical_improvement}', 'thuis', NULL),
('Hardlopen', 'Ga 20-30 minuten hardlopen op een comfortabel tempo. Gebruik interval als je beginner bent.', 'physical_health', 'high', 30, '{physical_improvement,energy_boost}', 'buiten', 'Hardloopschoenen'),

-- Mentale gezondheid & welzijn
('Dankbaarheidsdagboek', 'Schrijf 3 dingen op waar je dankbaar voor bent vandaag. Wees specifiek.', 'mental_wellbeing', 'low', 5, '{relaxation,mental_stimulation}', 'thuis', 'Dagboek/notitieblok'),
('Journaling', 'Schrijf 10 minuten vrij over je gedachten en gevoelens. Geen regels, gewoon schrijven.', 'mental_wellbeing', 'low', 10, '{relaxation,mental_stimulation}', 'thuis', 'Dagboek/notitieblok'),
('Positieve affirmaties', 'Spreek 5 positieve affirmaties uit voor de spiegel. Geloof in wat je zegt.', 'mental_wellbeing', 'low', 5, '{relaxation,energy_boost}', 'thuis', NULL),
('Mindful wandeling', 'Wandel langzaam en bewust. Let op elke stap, elke ademhaling, elk geluid.', 'mental_wellbeing', 'low', 15, '{relaxation,physical_improvement}', 'buiten', NULL),
('Digital detox', 'Leg alle schermen weg voor 30 minuten. Lees, teken, wandel of doe niets.', 'mental_wellbeing', 'low', 30, '{relaxation}', 'overal', NULL),
('Zelfcompassie oefening', 'Schrijf een brief aan jezelf alsof je schrijft naar een goede vriend die het moeilijk heeft.', 'mental_wellbeing', 'low', 15, '{relaxation,mental_stimulation}', 'thuis', 'Pen en papier'),

-- Creativiteit
('Vrij tekenen', 'Pak een pen en papier en teken wat in je opkomt. Geen regels, geen oordeel.', 'creativity', 'low', 15, '{creativity,relaxation}', 'thuis', 'Pen en papier'),
('Verhaal schrijven', 'Schrijf een kort verhaal van 200 woorden. Begin met: "Op een dag..."', 'creativity', 'medium', 20, '{creativity,mental_stimulation}', 'thuis', 'Pen/laptop'),
('Muziek maken', 'Pak een instrument of gebruik een app om muziek te maken. Improviseer vrij.', 'creativity', 'medium', 30, '{creativity,relaxation}', 'thuis', 'Instrument/muziek-app'),
('Fotowandeling', 'Ga naar buiten en maak 10 creatieve fotos van alledaagse dingen.', 'creativity', 'medium', 30, '{creativity,energy_boost}', 'buiten', 'Telefoon/camera'),
('Brainstorm sessie', 'Kies een probleem en schrijf in 10 minuten zoveel mogelijk oplossingen op. Alles mag.', 'creativity', 'medium', 10, '{creativity,mental_stimulation}', 'overal', 'Pen en papier'),
('Koken zonder recept', 'Maak een gerecht met wat je in huis hebt. Experimenteer met smaken en kruiden.', 'creativity', 'medium', 45, '{creativity,physical_improvement}', 'thuis', 'Keukenbenodigdheden'),
('Collage maken', 'Knip afbeeldingen uit tijdschriften en maak een moodboard of collage.', 'creativity', 'low', 30, '{creativity,relaxation}', 'thuis', 'Tijdschriften, schaar, lijm'),

-- Sociale interactie & community
('Bel een vriend', 'Bel iemand die je al even niet gesproken hebt. Vraag hoe het gaat en luister echt.', 'social_interaction', 'low', 15, '{social_connection}', 'overal', 'Telefoon'),
('Complimenten geven', 'Geef vandaag 3 oprechte complimenten aan mensen om je heen.', 'social_interaction', 'low', 10, '{social_connection,energy_boost}', 'overal', NULL),
('Samen wandelen', 'Nodig iemand uit voor een wandeling. Combineer beweging met sociaal contact.', 'social_interaction', 'medium', 30, '{social_connection,physical_improvement}', 'buiten', NULL),
('Kaartje sturen', 'Schrijf een kaartje of bericht naar iemand die je waardeert.', 'social_interaction', 'low', 10, '{social_connection,creativity}', 'thuis', 'Kaart/pen'),
('Spelletjesavond plannen', 'Organiseer een bordspelletje met vrienden of familie.', 'social_interaction', 'medium', 60, '{social_connection,mental_stimulation}', 'thuis', 'Bordspel'),
('Vrijwilligerswerk', 'Zoek een lokaal vrijwilligersproject en meld je aan voor een sessie.', 'social_interaction', 'medium', 60, '{social_connection,physical_improvement}', 'buiten', NULL),

-- Educatie & persoonlijke ontwikkeling
('TED Talk kijken', 'Kijk een inspirerende TED Talk over een onderwerp dat je interesseert.', 'education', 'low', 15, '{learning,mental_stimulation}', 'thuis', 'Scherm'),
('Nieuwe taal oefenen', 'Oefen 15 minuten een nieuwe taal via Duolingo of een andere app.', 'education', 'medium', 15, '{learning,mental_stimulation}', 'overal', 'Telefoon'),
('Boek lezen', 'Lees 20 paginas van een boek. Non-fictie voor leren, fictie voor ontspanning.', 'education', 'low', 30, '{learning,relaxation}', 'overal', 'Boek'),
('Online cursus', 'Volg een les van een online cursus op Coursera, Udemy of YouTube.', 'education', 'medium', 30, '{learning}', 'thuis', 'Laptop'),
('Documentaire kijken', 'Bekijk een korte documentaire over een onderwerp dat je nieuwsgierig maakt.', 'education', 'low', 45, '{learning,mental_stimulation}', 'thuis', 'Scherm'),
('Skill oefenen', 'Besteed 15 minuten aan het oefenen van een vaardigheid die je wilt verbeteren.', 'education', 'medium', 15, '{learning}', 'overal', NULL),

-- Energie tracking / zelfreflectie
('Energie check-in', 'Beoordeel je huidige energie op een schaal van 1-5. Noteer wat je energie beïnvloedt.', 'self_reflection', 'low', 5, '{mental_stimulation}', 'overal', NULL),
('Weekreflectie', 'Reflecteer op je week: wat ging goed, wat kan beter, wat heb je geleerd?', 'self_reflection', 'low', 15, '{mental_stimulation,learning}', 'thuis', 'Dagboek'),
('Doelen review', 'Bekijk je doelen en pas ze aan. Zijn ze nog relevant? Maak ze concreter.', 'self_reflection', 'medium', 15, '{mental_stimulation,learning}', 'thuis', 'Notitieblok'),
('Energiedagboek bijwerken', 'Noteer je energiepatronen van vandaag: pieken, dalen, en wat ze veroorzaakte.', 'self_reflection', 'low', 10, '{mental_stimulation}', 'thuis', 'Dagboek'),
('Mindmap maken', 'Maak een mindmap van je huidige projecten, ideeën of zorgen.', 'self_reflection', 'medium', 15, '{mental_stimulation,creativity}', 'thuis', 'Pen en papier'),

-- Mini-challenges
('Koud water uitdaging', 'Drink een groot glas ijskoud water in één keer. Simpel maar verfrissend.', 'mini_challenge', 'low', 2, '{energy_boost}', 'thuis', 'Water'),
('100 stappen challenge', 'Sta op en loop 100 stappen. Tel ze hardop voor extra focus.', 'mini_challenge', 'low', 3, '{energy_boost,physical_improvement}', 'overal', NULL),
('Bureau opruimen', 'Ruim je bureau of werkplek op in 5 minuten. Timer aan!', 'mini_challenge', 'low', 5, '{focus,energy_boost}', 'thuis', NULL),
('5 minuten meditatie', 'Mediteer exact 5 minuten. Focus alleen op je ademhaling.', 'mini_challenge', 'low', 5, '{relaxation,focus}', 'overal', NULL),
('Kracht challenge', 'Doe zoveel mogelijk push-ups in 1 minuut. Noteer je record.', 'mini_challenge', 'high', 5, '{physical_improvement,energy_boost}', 'thuis', NULL),
('Random act of kindness', 'Doe iets aardigs voor een vreemde. Houd een deur open, geef een compliment.', 'mini_challenge', 'low', 5, '{social_connection,energy_boost}', 'buiten', NULL),
('Lach challenge', 'Kijk een grappige video van 5 minuten. Lachen is de beste energieboost.', 'mini_challenge', 'low', 5, '{energy_boost,relaxation}', 'overal', 'Telefoon');
