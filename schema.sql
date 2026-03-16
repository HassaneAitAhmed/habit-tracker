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

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (
    new.id,
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;   
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


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



create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name        text not null,
  emoji       text not null default '⭐',
  color       text not null default '#C4924A',
  freq        text not null default 'daily'
                check (freq in ('daily','weekdays','weekends','custom')),
  custom_days integer[] default '{}',
  week_goal   integer not null default 5 check (week_goal between 1 and 7),
  sort_order  integer default 0,
  archived    boolean default false,
  created_at  timestamptz default now()
);

alter table habits enable row level security;

drop policy if exists "Users manage own habits" on habits;
create policy "Users manage own habits"
  on habits for all using (auth.uid() = user_id);


create table if not exists habit_checks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  habit_id   uuid references habits(id) on delete cascade not null,
  checked_on date not null,
  created_at timestamptz default now(),
  unique(habit_id, checked_on)
);

alter table habit_checks enable row level security;

drop policy if exists "Users manage own checks" on habit_checks;
create policy "Users manage own checks"
  on habit_checks for all using (auth.uid() = user_id);

create index if not exists idx_checks_user_month
  on habit_checks (user_id, checked_on);


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


create table if not exists habit_notes (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  year     integer not null,
  month    integer not null check (month between 0 and 11),
  content  text not null,
  created_at timestamptz default now(),
  unique(habit_id, year, month)
);

alter table habit_notes enable row level security;

drop policy if exists "Users manage own habit notes" on habit_notes;
create policy "Users manage own habit notes"
  on habit_notes for all using (auth.uid() = user_id);


create table if not exists user_settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  dark_mode     boolean default false,
  reminder_on   boolean default false,
  reminder_time text default '20:00',
  updated_at    timestamptz default now()
);

alter table user_settings enable row level security;

drop policy if exists "Users manage own settings" on user_settings;
create policy "Users manage own settings"
  on user_settings for all using (auth.uid() = user_id);


create index if not exists idx_habits_user       on public.habits (user_id);
create index if not exists idx_categories_user   on public.categories (user_id);
create index if not exists idx_checks_user_date  on public.habit_checks (user_id, checked_on);
create index if not exists idx_mood_user_date    on public.mood_logs (user_id, log_date);
create index if not exists idx_journal_user_date on public.journal_notes (user_id, note_date);
create index if not exists idx_hnotes_user       on public.habit_notes (user_id);
create index if not exists idx_settings_user     on public.user_settings (user_id);


drop policy if exists "Users manage own habits" on public.habits;
create policy "Users manage own habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


drop policy if exists "Users manage own categories" on public.categories;
create policy "Users manage own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own checks" on public.habit_checks;
create policy "Users manage own checks" on public.habit_checks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own mood logs" on public.mood_logs;
create policy "Users manage own mood logs" on public.mood_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own journal notes" on public.journal_notes;
create policy "Users manage own journal notes" on public.journal_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own habit notes" on public.habit_notes;
create policy "Users manage own habit notes" on public.habit_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
exception
  when others then
    return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz default now()
);

create table if not exists public.user_settings (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  dark_mode      boolean default false,
  reminder_on    boolean default false,
  reminder_time  text default '20:00',
  updated_at     timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users manage own settings" on public.user_settings;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on public.profiles to postgres, anon, authenticated, service_role;
grant all on public.user_settings to postgres, anon, authenticated, service_role;


grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;



alter table public.user_settings
  add column if not exists theme text default 'light';