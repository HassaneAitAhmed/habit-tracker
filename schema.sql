-- ============================================================
--  DISCIPLINE — Habit Tracker
--  Full PostgreSQL Schema for Supabase
--  Safe to re-run: uses IF NOT EXISTS / DROP ... IF EXISTS
--  Run this single file in your Supabase SQL Editor
-- ============================================================


-- ── PROFILES ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can view own profile"   on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);


-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ── CATEGORIES ───────────────────────────────────────────────────────────
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  color      text not null default '#C4924A',
  created_at timestamptz default now()
);

alter table categories enable row level security;

drop policy if exists "Users manage own categories" on categories;
create policy "Users manage own categories"
  on categories for all using (auth.uid() = user_id);


-- ── HABITS ───────────────────────────────────────────────────────────────
create table if not exists habits (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  category_id        uuid references categories(id) on delete set null,
  name               text not null,
  emoji              text not null default '⭐',
  color              text not null default '#C4924A',
  freq               text not null default 'daily'
                       check (freq in ('daily','weekdays','weekends','custom')),
  custom_days        integer[] default '{}',
  week_goal          integer not null default 5 check (week_goal between 1 and 7),
  sort_order         integer default 0,
  archived           boolean default false,
  completion_type    text default 'check'
                       check (completion_type in ('check','count','duration')),
  completion_unit    text default '',
  completion_target  integer default 1,
  created_at         timestamptz default now()
);

alter table habits enable row level security;

drop policy if exists "Users manage own habits" on habits;
create policy "Users manage own habits"
  on habits for all using (auth.uid() = user_id);

create index if not exists idx_habits_user       on habits (user_id);
create index if not exists idx_habits_sort        on habits (user_id, sort_order);


-- ── HABIT CHECKS ─────────────────────────────────────────────────────────
create table if not exists habit_checks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  habit_id   uuid references habits(id) on delete cascade not null,
  checked_on date not null,
  value      integer default 1,
  created_at timestamptz default now(),
  unique(habit_id, checked_on)
);

alter table habit_checks enable row level security;

drop policy if exists "Users manage own checks" on habit_checks;
create policy "Users manage own checks"
  on habit_checks for all using (auth.uid() = user_id);

create index if not exists idx_checks_user_date
  on habit_checks (user_id, checked_on);
create index if not exists idx_checks_habit
  on habit_checks (habit_id);


-- ── MOOD LOGS ────────────────────────────────────────────────────────────
create table if not exists mood_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  log_date   date not null,
  mood       integer check (mood between 1 and 10),
  motivation integer check (motivation between 1 and 10),
  created_at timestamptz default now(),
  unique(user_id, log_date)
);

alter table mood_logs enable row level security;

drop policy if exists "Users manage own mood logs" on mood_logs;
create policy "Users manage own mood logs"
  on mood_logs for all using (auth.uid() = user_id);

create index if not exists idx_moods_user_date
  on mood_logs (user_id, log_date);


-- ── JOURNAL NOTES ────────────────────────────────────────────────────────
create table if not exists journal_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  note_date  date not null,
  content    text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, note_date)
);

alter table journal_notes enable row level security;

drop policy if exists "Users manage own journal notes" on journal_notes;
create policy "Users manage own journal notes"
  on journal_notes for all using (auth.uid() = user_id);

create index if not exists idx_journal_user_date
  on journal_notes (user_id, note_date desc);


-- ── HABIT NOTES ──────────────────────────────────────────────────────────
create table if not exists habit_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  habit_id   uuid references habits(id) on delete cascade not null,
  year       integer not null,
  month      integer not null check (month between 0 and 11),
  content    text not null,
  created_at timestamptz default now(),
  unique(habit_id, year, month)
);

alter table habit_notes enable row level security;

drop policy if exists "Users manage own habit notes" on habit_notes;
create policy "Users manage own habit notes"
  on habit_notes for all using (auth.uid() = user_id);


-- ── USER SETTINGS ────────────────────────────────────────────────────────
create table if not exists user_settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  dark_mode     boolean default false,
  theme         text default 'light'
                  check (theme in ('light','dark','pink')),
  reminder_on   boolean default false,
  reminder_time text default '20:00',
  updated_at    timestamptz default now()
);

alter table user_settings enable row level security;

drop policy if exists "Users manage own settings" on user_settings;
create policy "Users manage own settings"
  on user_settings for all using (auth.uid() = user_id);


-- ── HABIT STACKS ─────────────────────────────────────────────────────────
create table if not exists habit_stacks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null default 'My Stack',
  emoji      text not null default '🔗',
  habit_ids  uuid[] not null default '{}',
  created_at timestamptz default now()
);

alter table habit_stacks enable row level security;

drop policy if exists "Users manage own stacks" on habit_stacks;
create policy "Users manage own stacks"
  on habit_stacks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_stacks_user on habit_stacks (user_id);


-- ── STREAK FREEZES ───────────────────────────────────────────────────────
create table if not exists streak_freezes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  habit_id   uuid references habits(id) on delete cascade not null,
  year       integer not null,
  month      integer not null,
  used_on    date,
  created_at timestamptz default now(),
  unique(user_id, habit_id, year, month)
);

alter table streak_freezes enable row level security;

drop policy if exists "Users manage own freezes" on streak_freezes;
create policy "Users manage own freezes"
  on streak_freezes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_freezes_user    on streak_freezes (user_id);
create index if not exists idx_freezes_habit   on streak_freezes (habit_id);


-- ── GRANTS ───────────────────────────────────────────────────────────────
grant all on public.profiles        to authenticated;
grant all on public.categories      to authenticated;
grant all on public.habits          to authenticated;
grant all on public.habit_checks    to authenticated;
grant all on public.mood_logs       to authenticated;
grant all on public.journal_notes   to authenticated;
grant all on public.habit_notes     to authenticated;
grant all on public.user_settings   to authenticated;
grant all on public.habit_stacks    to authenticated;
grant all on public.streak_freezes  to authenticated;
