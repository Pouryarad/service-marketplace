create extension if not exists "pgcrypto";

create type user_role as enum ('client', 'provider', 'admin');
create type provider_status as enum ('draft', 'completed', 'pending', 'approved', 'active', 'expired', 'suspended');
create type subscription_status as enum ('active', 'expired', 'pending', 'none');
create type request_status as enum ('new', 'contacted');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

create table public.categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  subtitle text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  business_name text,
  category_id text not null references public.categories(id),
  profile_photo_url text not null,
  portfolio_photo_urls text[] not null default '{}',
  email text not null,
  phone text not null,
  location text not null,
  language text not null default 'English',
  bio text not null default '',
  one_line text not null default '',
  approved boolean not null default false,
  suspended boolean not null default false,
  status provider_status not null default 'draft',
  subscription_status subscription_status not null default 'none',
  subscription_expires_at timestamptz,
  featured_rank int,
  clicks_day int not null default 0,
  clicks_week int not null default 0,
  clicks_month int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid references auth.users(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, provider_id)
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.provider_profiles(id) on delete set null,
  provider_name text not null,
  client_id uuid references auth.users(id) on delete set null,
  client_name text not null,
  client_email text not null,
  phone text,
  message text not null,
  status request_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.pricing_settings (
  id boolean primary key default true,
  subscription_price_cents int not null default 4900,
  featured_price_cents int not null default 9900,
  updated_at timestamptz not null default now(),
  constraint singleton_pricing check (id)
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  audience text not null,
  type text not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

insert into public.categories (id, slug, name, subtitle, image_url) values
  ('home-cleaning', 'home-cleaning', 'Home Cleaning', 'Reliable cleaners for homes, rentals, and offices.', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'),
  ('plumbing', 'plumbing', 'Plumbing', 'Leak repairs, installs, inspections, and urgent help.', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80'),
  ('beauty', 'beauty', 'Beauty', 'Stylists, makeup artists, nails, and personal care.', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80'),
  ('tutoring', 'tutoring', 'Tutoring', 'Academic support, test prep, and language lessons.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80'),
  ('fitness', 'fitness', 'Fitness', 'Personal training, yoga, pilates, and wellness coaching.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'),
  ('photography', 'photography', 'Photography', 'Portraits, events, products, and family sessions.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80'),
  ('moving', 'moving', 'Moving', 'Local moves, packing, deliveries, and lifting help.', 'https://images.unsplash.com/photo-1600518464441-9306b00c4b2c?auto=format&fit=crop&w=900&q=80'),
  ('landscaping', 'landscaping', 'Landscaping', 'Lawn care, garden design, cleanups, and seasonal work.', 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80')
on conflict (id) do nothing;

insert into public.pricing_settings (id) values (true) on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.contact_requests enable row level security;
alter table public.pricing_settings enable row level security;
alter table public.notification_events enable row level security;

create policy "Categories are public" on public.categories for select using (true);
create policy "Visible providers are public" on public.provider_profiles for select using (
  approved = true and subscription_status = 'active' and suspended = false
);
create policy "Providers manage own profile" on public.provider_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage providers" on public.provider_profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins read profiles" on public.profiles for select using (public.is_admin());
create policy "Users manage favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users create requests" on public.contact_requests for insert with check (auth.uid() = client_id);
create policy "Users read own requests" on public.contact_requests for select using (auth.uid() = client_id);
create policy "Providers read assigned requests" on public.contact_requests for select using (
  exists (
    select 1 from public.provider_profiles
    where provider_profiles.id = contact_requests.provider_id
      and provider_profiles.user_id = auth.uid()
  )
);
create policy "Providers update assigned requests" on public.contact_requests for update using (
  exists (
    select 1 from public.provider_profiles
    where provider_profiles.id = contact_requests.provider_id
      and provider_profiles.user_id = auth.uid()
  )
);
create policy "Admins manage requests" on public.contact_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "Pricing readable" on public.pricing_settings for select using (true);
create policy "Admins update pricing" on public.pricing_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "Notifications insertable" on public.notification_events for insert with check (auth.uid() is not null);
create policy "Admins read notifications" on public.notification_events for select using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('provider-media', 'provider-media', true)
on conflict (id) do nothing;

create policy "Provider media is public" on storage.objects for select using (bucket_id = 'provider-media');
create policy "Authenticated users upload provider media" on storage.objects for insert with check (
  bucket_id = 'provider-media' and auth.role() = 'authenticated'
);
create policy "Owners update provider media" on storage.objects for update using (
  bucket_id = 'provider-media' and auth.uid()::text = (storage.foldername(name))[1]
);
