-- Complete schema update for Flow State full version
-- Adds missing columns, new tables, and policies

-- =============================================
-- 1. Fix tasks table: add missing columns
-- =============================================
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('google', 'outlook', 'manual')) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT CHECK (recurrence_rule IN ('daily', 'weekly', 'monthly')),
  ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Unique index to prevent duplicate calendar event imports
CREATE UNIQUE INDEX IF NOT EXISTS tasks_external_id_source_user_idx
  ON public.tasks (user_id, external_id, source)
  WHERE external_id IS NOT NULL;

-- =============================================
-- 2. Fix profiles table: add subscription
-- =============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'pro'));

-- =============================================
-- 3. Chat messages: add DELETE policy
-- =============================================
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;
CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. New table: habits
-- =============================================
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  target_count INTEGER DEFAULT 1,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'check',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own habits"
  ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits"
  ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits"
  ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 5. New table: habit_logs
-- =============================================
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (habit_id, completed_at)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own habit_logs"
  ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habit_logs"
  ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habit_logs"
  ON public.habit_logs FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 6. New table: wearable_tokens
-- =============================================
CREATE TABLE IF NOT EXISTS public.wearable_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('garmin', 'fitbit', 'oura', 'apple_health', 'samsung_health')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.wearable_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wearable_tokens"
  ON public.wearable_tokens FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 7. New table: push_tokens
-- =============================================
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push_tokens"
  ON public.push_tokens FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 8. Timestamp trigger for habits
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_habits_updated_at ON public.habits;
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
