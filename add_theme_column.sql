-- Run this in Supabase SQL Editor to add the theme column
-- (Only needed if you already ran the original schema.sql)
alter table public.user_settings
  add column if not exists theme text default 'light';
