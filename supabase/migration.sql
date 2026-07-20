-- Elysian Supabase migration
-- Run this whole file once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query -> paste -> Run).

-- ─── profiles (extends auth.users with an admin flag) ───────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false
);
alter table profiles enable row level security;
create policy "select own profile" on profiles for select using (auth.uid() = id);

-- auto-create a profile row whenever someone signs up
-- `set search_path = public` is required: security definer functions don't
-- inherit a reliable search_path, so without it Postgres can't resolve
-- `profiles` and the trigger fails with a generic "Database error saving new user".
create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end; $$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- centralized admin check, security definer so it bypasses profiles' own RLS
create function is_admin() returns boolean as $$
  select exists(select 1 from public.profiles where id = auth.uid() and is_admin);
$$ language sql stable security definer set search_path = public;

-- ─── properties ──────────────────────────────────────────────────────────────
create table properties (
  id bigint generated always as identity primary key,
  title text not null,
  type text not null,
  city text not null,
  country text not null,
  price text not null,
  beds text,
  baths text,
  size text,
  img text not null,
  extra_photos text[] default '{}',
  description text,
  features text[] default '{}',
  created_at timestamptz not null default now()
);
alter table properties enable row level security;
create policy "public read" on properties for select using (true);
create policy "admin insert" on properties for insert with check (is_admin());
create policy "admin update" on properties for update using (is_admin()) with check (is_admin());
create policy "admin delete" on properties for delete using (is_admin());

-- ─── agents ──────────────────────────────────────────────────────────────────
create table agents (
  id bigint generated always as identity primary key,
  name text not null,
  role text not null,
  type text not null default 'expert',
  img text,
  bio text,
  languages text,
  phone text,
  email text
);
alter table agents enable row level security;
create policy "public read" on agents for select using (true);
create policy "admin insert" on agents for insert with check (is_admin());
create policy "admin update" on agents for update using (is_admin()) with check (is_admin());
create policy "admin delete" on agents for delete using (is_admin());

-- ─── messages (contact / property inquiry / chatbot) ─────────────────────────
create table messages (
  id bigint generated always as identity primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  subject text,
  message text,
  property text,
  property_img text,
  created_at timestamptz not null default now()
);
alter table messages enable row level security;
create policy "anyone can submit" on messages for insert with check (true);
create policy "admin read" on messages for select using (is_admin());
create policy "admin delete" on messages for delete using (is_admin());

-- ─── newsletter subscribers ──────────────────────────────────────────────────
create table subscribers (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table subscribers enable row level security;
create policy "anyone can subscribe" on subscribers for insert with check (true);
create policy "admin read" on subscribers for select using (is_admin());
create policy "admin delete" on subscribers for delete using (is_admin());

-- ─── favorites (per logged-in user) ──────────────────────────────────────────
create table favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id bigint not null references properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
alter table favorites enable row level security;
create policy "own favorites" on favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── enable realtime for the admin notification badge ────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table subscribers;

-- ─── seed data (current hardcoded properties + agents) ───────────────────────
insert into properties (title, type, city, country, price, beds, baths, size, img, extra_photos, description, features) values
  ('Palm Luxury Residence', 'Apartment', 'Dubai', 'UAE', '$2.4M', '4 Beds', '3 Baths', '420m²', 'https://images.unsplash.com/photo-1494526585095-c41746248156', array[]::text[], 'An extraordinary waterfront apartment on the iconic Palm Jumeirah. Floor-to-ceiling windows frame panoramic views of the Arabian Gulf, while the open-plan living space blends contemporary design with warm natural materials. Includes a private terrace, chef''s kitchen, and direct beach access.', array['Private Terrace', 'Beach Access', 'Chef''s Kitchen', 'Concierge Service', 'Underground Parking', 'Smart Home System']),
  ('Parisian Grand Villa', 'Villa', 'Paris', 'France', '$5.9M', '6 Beds', '5 Baths', '720m²', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', array[]::text[], 'A timeless Haussmann-style villa nestled in the prestigious 16th arrondissement. Featuring original parquet floors, ornate ceiling mouldings, and a manicured garden, this property seamlessly marries classic Parisian elegance with modern luxury interiors.', array['Manicured Garden', 'Wine Cellar', 'Home Cinema', 'Staff Quarters', 'Heated Pool', 'Gated Entry']),
  ('Manhattan Sky Penthouse', 'Penthouse', 'New York', 'USA', '$9.2M', '5 Beds', '4 Baths', '950m²', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', array[]::text[], 'Perched atop one of Midtown Manhattan''s most coveted towers, this full-floor penthouse delivers breathtaking 360° views of Central Park and the New York skyline. Designed by an award-winning architect, every detail speaks to elevated urban living.', array['360° City Views', 'Private Rooftop', 'Butler''s Pantry', 'Library', 'Gym', 'Doorman Building']),
  ('London Modern Loft', 'Apartment', 'London', 'UK', '$1.8M', '3 Beds', '2 Baths', '310m²', 'https://images.unsplash.com/photo-1484154218962-a197022b5858', array[]::text[], 'A stunning converted warehouse loft in the heart of Shoreditch, blending industrial character with refined modern finishes. Exposed brick, soaring ceilings, and bespoke joinery create a uniquely captivating living environment.', array['Exposed Brick', 'Double-Height Ceilings', 'Roof Terrace', 'Secure Parking', 'Concierge', 'EV Charging']),
  ('Golden Palm Estate', 'Villa', 'Dubai', 'UAE', '$7.5M', '7 Beds', '6 Baths', '1200m²', 'https://images.unsplash.com/photo-1448630360428-65456885c650', array[]::text[], 'An ultra-luxurious family estate on the Palm''s exclusive frond, offering unrivalled privacy and space. The sprawling compound features a private beach, infinity pool, landscaped gardens, and a fully equipped entertainment wing.', array['Private Beach', 'Infinity Pool', 'Entertainment Wing', 'Home Gym', 'Staff Accommodation', 'Smart Security']),
  ('Eiffel View Penthouse', 'Penthouse', 'Paris', 'France', '$4.7M', '4 Beds', '4 Baths', '650m²', 'https://images.unsplash.com/photo-1460317442991-0ec209397118', array[]::text[], 'Wake up to an unobstructed view of the Eiffel Tower from this extraordinary penthouse in the 7th arrondissement. Wrapped in a wrap-around terrace and finished with the finest materials, it is the ultimate Parisian address.', array['Eiffel Tower View', 'Wrap-Around Terrace', 'Private Lift', 'Marble Bathrooms', 'Climate Control', 'Concierge']);

insert into agents (name, role, type, img, bio, languages, phone, email) values
  ('Michael Chen', 'Co-Founder & CEO', 'founder', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80', 'Visionary behind global luxury expansion.', 'English, Mandarin, French', '+1 (310) 555-0123', 'michael.chen@elysian.com'),
  ('Isabella Rossi', 'Co-Founder & Director', 'founder', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', 'Leads design & elite client experience.', 'English, Italian, Spanish', '+1 (310) 555-0124', 'isabella.rossi@elysian.com'),
  ('Daniel Carter', 'Investment Consultant', 'expert', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'Specialist in high-yield investment portfolios.', 'English, German', '+1 (310) 555-0125', 'daniel.carter@elysian.com'),
  ('Sophia Laurent', 'Architectural Advisor', 'expert', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', 'Expert in luxury design and architecture.', 'English, French', '+1 (310) 555-0126', 'sophia.laurent@elysian.com'),
  ('James Walker', 'Market Analyst', 'expert', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80', 'Provides deep market intelligence and trends.', 'English', '+1 (310) 555-0127', 'james.walker@elysian.com'),
  ('Emily Stone', 'Luxury Property Strategist', 'expert', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'Crafts bespoke property strategies for elite clients.', 'English, Portuguese', '+1 (310) 555-0128', 'emily.stone@elysian.com'),
  ('Lucas Meyer', 'Real Estate Legal Advisor', 'expert', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', 'Navigates complex legal frameworks globally.', 'English, German, Dutch', '+1 (310) 555-0129', 'lucas.meyer@elysian.com'),
  ('Olivia Bennett', 'Client Relations Director', 'expert', 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80', 'Curates white-glove experiences for every client.', 'English, Arabic', '+1 (310) 555-0130', 'olivia.bennett@elysian.com');

-- ─── after running this file ──────────────────────────────────────────────────
-- 1. Create your admin account: Dashboard -> Authentication -> Add User (use your real admin email/password).
-- 2. Copy that user's UUID from the Authentication table, then run:
--    update profiles set is_admin = true where id = 'PASTE-UUID-HERE';

-- ---------------------------------------------------------------------------
-- Maintenance mode: single-row global settings table.
-- Readable by everyone (public site checks it); writable only by admins.
-- ---------------------------------------------------------------------------
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

-- ─── user_profiles (public profile: display name + avatar, editable by the user) ──
-- Kept SEPARATE from `profiles` so users can freely edit their own row without
-- any ability to touch the admin flag. Run this block once for the account page.
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar text,           -- data URL (resized in the browser) or an image URL
  updated_at timestamptz not null default now()
);
alter table user_profiles enable row level security;
create policy "read own user_profile"   on user_profiles for select using (auth.uid() = id);
create policy "insert own user_profile" on user_profiles for insert with check (auth.uid() = id);
create policy "update own user_profile" on user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
