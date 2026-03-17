-- ============================================================
--  SCHEMA MIGRATION — New Features
--  Run in Supabase SQL Editor AFTER the original schema.sql
-- ============================================================

-- 1. Custom completion types on habits
--    type: 'check' | 'count' | 'duration'
--    unit: 'pages' | 'minutes' | 'glasses' | 'km' | custom
--    target: the number to hit (e.g. 10 pages, 30 minutes)
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS completion_type text DEFAULT 'check'
    CHECK (completion_type IN ('check','count','duration')),
  ADD COLUMN IF NOT EXISTS completion_unit text DEFAULT '',
  ADD COLUMN IF NOT EXISTS completion_target integer DEFAULT 1;

-- 2. habit_checks: store quantity value for count/duration types
ALTER TABLE public.habit_checks
  ADD COLUMN IF NOT EXISTS value integer DEFAULT 1;

-- 3. Habit stacks — ordered chains of habits
CREATE TABLE IF NOT EXISTS public.habit_stacks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       text NOT NULL DEFAULT 'My Stack',
  emoji      text NOT NULL DEFAULT '🔗',
  habit_ids  uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.habit_stacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own stacks" ON public.habit_stacks;
CREATE POLICY "Users manage own stacks" ON public.habit_stacks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Streak freezes — one per user per habit per month
CREATE TABLE IF NOT EXISTS public.streak_freezes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id   uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  year       integer NOT NULL,
  month      integer NOT NULL,
  used_on    date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, habit_id, year, month)
);
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own freezes" ON public.streak_freezes;
CREATE POLICY "Users manage own freezes" ON public.streak_freezes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_stacks_user   ON public.habit_stacks (user_id);
CREATE INDEX IF NOT EXISTS idx_freezes_user  ON public.streak_freezes (user_id);
GRANT ALL ON public.habit_stacks   TO authenticated;
GRANT ALL ON public.streak_freezes TO authenticated;
