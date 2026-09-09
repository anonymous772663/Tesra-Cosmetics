-- ============================================================
-- Tesra Cosmetics — Supabase schema, RLS policies, and seed data
-- Run this in the Supabase SQL editor on a fresh project.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- profiles: 1:1 with auth.users, holds onboarding + role data
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  city text,
  address text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  profile_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, profile_completed, role)
  values (new.id, false, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- products: the catalog
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  category text not null check (
    category in ('lashes', 'concealer', 'lip_liner', 'eye_liner', 'blender', 'lash_glue')
  ),
  price numeric(10, 2) not null default 0,
  stock integer not null default 0,
  images text[] not null default '{}',
  shades text[],
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view products"
  on public.products for select
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update products"
  on public.products for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can delete products"
  on public.products for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ------------------------------------------------------------
-- site_settings: single-row table driving the live site customizer
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  primary_color text not null default '#FF8FAB',
  accent_color text not null default '#590D22',
  announcement_banner text,
  hero_heading text not null default 'Soft glam, made to last.',
  hero_subheading text not null default 'Lashes, liners, and complexion essentials for Kathmandu''s everyday luxury.'
);

alter table public.site_settings enable row level security;

create policy "Anyone can view site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

insert into public.site_settings (primary_color, accent_color, hero_heading, hero_subheading)
select '#FF8FAB', '#590D22', 'Soft glam, made to last.',
       'Lashes, liners, and complexion essentials for everyday luxury.'
where not exists (select 1 from public.site_settings);

-- ------------------------------------------------------------
-- Seed catalog
-- ------------------------------------------------------------
insert into public.products (title, description, category, price, stock, images, shades) values
  ('Single Pair Lashes', 'Featherlight everyday lashes with a natural flared shape. Reusable up to 20 times with proper care.', 'lashes', 350, 120, array['https://images.unsplash.com/photo-1583241800698-e8ab01c98722?w=800'], null),
  ('7-Pair Lash Pack', 'A week''s worth of curated lash styles, from subtle daytime to soft glam.', 'lashes', 1800, 60, array['https://images.unsplash.com/photo-1583241800698-e8ab01c98722?w=800'], null),
  ('10-Pair Lash Value Pack', 'Our full lash wardrobe in one box — best value per pair for regular wearers.', 'lashes', 2400, 40, array['https://images.unsplash.com/photo-1583241800698-e8ab01c98722?w=800'], null),
  ('Concealer — Natural', 'Full-coverage, crease-resistant concealer in Natural, our lightest neutral tone.', 'concealer', 950, 80, array['https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800'], null),
  ('Concealer — Beige', 'Full-coverage, crease-resistant concealer in Beige, a soft warm-neutral tone.', 'concealer', 950, 80, array['https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800'], null),
  ('Concealer — Warm Beige', 'Full-coverage, crease-resistant concealer in Warm Beige, for golden-medium skin tones.', 'concealer', 950, 70, array['https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800'], null),
  ('Concealer — Ivory', 'Full-coverage, crease-resistant concealer in Ivory, our lightest cool-toned shade.', 'concealer', 950, 65, array['https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800'], null),
  ('Lip Liner — Shade 01', 'Creamy, long-wearing lip liner in a warm rose tone that anchors your lip colour all day.', 'lip_liner', 550, 100, array['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800'], null),
  ('Lip Liner — Shade 02', 'Creamy, long-wearing lip liner in a deep berry tone that anchors your lip colour all day.', 'lip_liner', 550, 100, array['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800'], null),
  ('Eye Liner — Shade 01', 'Waterproof, smudge-resistant eye liner in Classic Black for a precise wing every time.', 'eye_liner', 600, 100, array['https://images.unsplash.com/photo-1512207736890-6ffed1d901b4?w=800'], null),
  ('Eye Liner — Shade 02', 'Waterproof, smudge-resistant eye liner in Espresso Brown for a soft, precise line.', 'eye_liner', 600, 100, array['https://images.unsplash.com/photo-1512207736890-6ffed1d901b4?w=800'], null),
  ('Beauty Blender', 'Soft, latex-free sponge that blends base makeup to a seamless, airbrushed finish.', 'blender', 450, 150, array['https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800'], null),
  ('Premium Lash Glue', 'Latex-free, long-hold lash adhesive that stays clear and flexible all day.', 'lash_glue', 400, 90, array['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'], null)
on conflict do nothing;
