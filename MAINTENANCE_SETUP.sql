-- ===========================================================================
-- Terra Estates — Maintenance Mode setup
-- Run this ONCE in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- After it runs, go to Admin → Settings → Maintenance Mode (password: terra2026).
-- ===========================================================================

create table if not exists app_settings (
  id int primary key default 1,
  maintenance_mode boolean not null default false,
  updated_at timestamptz default now(),
  constraint app_settings_single_row check (id = 1)
);

insert into app_settings (id, maintenance_mode)
  values (1, false)
  on conflict (id) do nothing;

alter table app_settings enable row level security;

create policy "app_settings readable by all"
  on app_settings for select using (true);

create policy "app_settings writable by admins"
  on app_settings for update using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
