-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. SEASONS TABLE
-- Stores the active Ramadan season (e.g., 1447H) to support multi-year data.
create table public.seasons (
  season_id text primary key, -- e.g. "1447H"
  start_date date not null,
  end_date date not null,
  is_active boolean default false
);

-- Initial Data for testing
insert into public.seasons (season_id, start_date, end_date, is_active)
values ('1447H', '2026-02-18', '2026-03-20', true);


-- 2. USERS TABLE
-- Public profile table extending Supabase Auth.
create table public.users (
  user_id uuid references auth.users not null primary key,
  nama text not null,
  no_wa text unique not null,
  gender text check (gender in ('L', 'P')), -- L = Laki-laki, P = Perempuan
  role text check (role in ('jamaah_dewasa', 'jamaah_anak', 'panitia', 'admin_media', 'admin_utama')),
  qr_code_token text unique default uuid_generate_v4(), -- Used for QR Code generation
  created_at timestamptz default now()
);

-- RLS: Security Policies
alter table public.users enable row level security;

-- Policy: Everyone can view profiles (needed for scanning/admin)
create policy "Public profiles are viewable by everyone" 
on public.users for select 
using (true);

-- Policy: Users can update their own profile
create policy "Users can update own profile" 
on public.users for update 
using (auth.uid() = user_id);

-- Policy: Admins can update any profile
create policy "Admins can update any profile"
on public.users for update
using (
  exists (
    select 1 from public.users
    where users.user_id = auth.uid()
    and users.role in ('admin_utama', 'panitia')
  )
);

-- Policy: Admins can delete users
create policy "Admins can delete users"
on public.users for delete
using (
  exists (
    select 1 from public.users
    where users.user_id = auth.uid()
    and users.role in ('admin_utama')
  )
);

-- Policy: Users can insert their own profile (during sign up)
-- 3. ATTENDANCE LOGS TABLE
create table public.attendance_logs (
    log_id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(user_id) not null,
    season_id text references public.seasons(season_id) not null,
    session_type text not null check (session_type in ('subuh', 'kegiatan_harian', 'tarawih')),
    scanned_at timestamptz default now(),
    scanned_by uuid references public.users(user_id), -- The panitia who scanned
    is_valid boolean default true,
    location_data jsonb -- Optional: Store snapshot of lat/long
);

-- RLS for Logs
alter table public.attendance_logs enable row level security;

-- Panitia can insert logs
create policy "Panitia can insert logs"
on public.attendance_logs for insert
with check (
    exists (
        select 1 from public.users
        where users.user_id = auth.uid()
        and users.role in ('panitia', 'admin_utama')
    )
);

-- Users can view their own logs
create policy "Users can view own logs"
on public.attendance_logs for select
using (auth.uid() = user_id);

-- Admins can view ALL attendance logs
create policy "Admins can view all logs"
on public.attendance_logs for select
using (
  exists (
    select 1 from public.users
    where users.user_id = auth.uid()
    and users.role in ('admin_utama', 'panitia', 'admin_media')
  )
);


-- 4. JOURNAL ENTRIES TABLE
create table public.journal_entries (
    entry_id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(user_id) not null,
    date date not null default CURRENT_DATE,
    puasa boolean default false,
    sholat_subuh boolean default false,
    sholat_zuhur boolean default false,
    sholat_ashar boolean default false,
    sholat_maghrib boolean default false,
    sholat_isya boolean default false,
    tadarus boolean default false,
    updated_at timestamptz default now(),
    unique(user_id, date) -- One entry per user per day
);

-- RLS for Journal
alter table public.journal_entries enable row level security;

-- Users can View, Insert, Update their own entries
create policy "Users can manage own journal"
on public.journal_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 5. WARTA BERITA TABLE
create table public.warta_berita (
    news_id uuid primary key default uuid_generate_v4(),
    title text not null,
    content text not null,
    image_url text, -- Optional
    created_at timestamptz default now(),
    author_id uuid references public.users(user_id)
);

-- RLS for Warta
alter table public.warta_berita enable row level security;

-- Everyone can view news
create policy "Everyone can view news"
on public.warta_berita for select
using (true);

-- 6. KAJIAN SUBUH TABLE
create table public.kajian_subuh (
    kajian_id uuid primary key default uuid_generate_v4(),
    tanggal date not null,
    hari text not null,
    hijriah text,
    pemateri text not null,
    tema text not null,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- RLS for Kajian
alter table public.kajian_subuh enable row level security;

-- Anyone can view kajian
create policy "Anyone can view kajian"
on public.kajian_subuh for select
using (true);

-- Admins can manage kajian
create policy "Admins can manage kajian"
on public.kajian_subuh for all
using (
    exists (
        select 1 from public.users
        where users.user_id = auth.uid()
        and users.role in ('admin_utama', 'panitia')
    )
);

-- Only Admin/Media can insert/update/delete news
create policy "Admins can manage news"
on public.warta_berita for all
using (
    exists (
        select 1 from public.users
        where users.user_id = auth.uid()
        and users.role in ('admin_media', 'admin_utama', 'panitia')
    )
);
