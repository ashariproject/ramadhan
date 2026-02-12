-- =============================================
-- SEED SCRIPT: 8 Default Panitia Accounts
-- Jalankan di Supabase SQL Editor
-- Aman dijalankan berulang (skip jika sudah ada)
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function yang skip jika email sudah ada
CREATE OR REPLACE FUNCTION create_panitia(p_email TEXT, p_nama TEXT) RETURNS void AS $$
DECLARE
  new_user_id UUID;
  existing_id UUID;
BEGIN
  -- Cek apakah sudah ada di auth.users
  SELECT id INTO existing_id FROM auth.users WHERE email = p_email;
  
  IF existing_id IS NOT NULL THEN
    -- Sudah ada, pastikan ada di public.users juga
    INSERT INTO public.users (user_id, nama, no_wa, gender, role)
    VALUES (existing_id, p_nama, REPLACE(p_email, '@assakinah.com', ''), 'L', 'panitia')
    ON CONFLICT (user_id) DO UPDATE SET role = 'panitia', nama = p_nama;
    RAISE NOTICE 'User % sudah ada, di-skip', p_email;
    RETURN;
  END IF;

  -- Buat baru
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt('panitiaramadhan', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}',
    '{}'
  )
  RETURNING id INTO new_user_id;

  INSERT INTO public.users (user_id, nama, no_wa, gender, role)
  VALUES (new_user_id, p_nama, REPLACE(p_email, '@assakinah.com', ''), 'L', 'panitia');
END;
$$ LANGUAGE plpgsql;

-- Create 8 Panitia Accounts
SELECT create_panitia('panitia1@assakinah.com', 'Panitia 1');
SELECT create_panitia('panitia2@assakinah.com', 'Panitia 2');
SELECT create_panitia('panitia3@assakinah.com', 'Panitia 3');
SELECT create_panitia('panitia4@assakinah.com', 'Panitia 4');
SELECT create_panitia('panitia5@assakinah.com', 'Panitia 5');
SELECT create_panitia('panitia6@assakinah.com', 'Panitia 6');
SELECT create_panitia('panitia7@assakinah.com', 'Panitia 7');
SELECT create_panitia('panitia8@assakinah.com', 'Panitia 8');

-- Cleanup
DROP FUNCTION create_panitia(TEXT, TEXT);

-- =============================================
-- NEW TABLE: Penilaian Anak (skip jika sudah ada)
-- =============================================
CREATE TABLE IF NOT EXISTS public.penilaian_anak (
    penilaian_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(user_id) NOT NULL,
    penilai_id UUID REFERENCES public.users(user_id),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kategori TEXT NOT NULL CHECK (kategori IN ('hafalan', 'adab', 'keaktifan', 'kebersihan')),
    nilai INTEGER CHECK (nilai >= 1 AND nilai <= 5),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.penilaian_anak ENABLE ROW LEVEL SECURITY;

-- Drop policies dulu kalau sudah ada, baru buat ulang
DROP POLICY IF EXISTS "Panitia can manage penilaian" ON public.penilaian_anak;
CREATE POLICY "Panitia can manage penilaian"
ON public.penilaian_anak FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.role IN ('panitia', 'admin_utama')
    )
);

DROP POLICY IF EXISTS "Anak can view own penilaian" ON public.penilaian_anak;
CREATE POLICY "Anak can view own penilaian"
ON public.penilaian_anak FOR SELECT
USING (auth.uid() = user_id);

-- RLS tambahan (skip jika sudah ada)
DROP POLICY IF EXISTS "Panitia can view all logs" ON public.attendance_logs;
CREATE POLICY "Panitia can view all logs"
ON public.attendance_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.role IN ('panitia', 'admin_utama')
    )
);

DROP POLICY IF EXISTS "Panitia can insert users" ON public.users;
CREATE POLICY "Panitia can insert users"
ON public.users FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.role IN ('panitia', 'admin_utama')
    )
    OR auth.uid() = user_id
);
