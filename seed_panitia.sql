-- =============================================
-- SEED SCRIPT: 8 Default Panitia Accounts
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create panitia user
CREATE OR REPLACE FUNCTION create_panitia(p_email TEXT, p_nama TEXT) RETURNS void AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users
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

  -- Insert into public.users
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

-- Cleanup helper function
DROP FUNCTION create_panitia(TEXT, TEXT);

-- =============================================
-- NEW TABLE: Penilaian Anak
-- =============================================
CREATE TABLE IF NOT EXISTS public.penilaian_anak (
    penilaian_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(user_id) NOT NULL, -- anak yang dinilai
    penilai_id UUID REFERENCES public.users(user_id),       -- panitia yang menilai
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kategori TEXT NOT NULL CHECK (kategori IN ('hafalan', 'adab', 'keaktifan', 'kebersihan')),
    nilai INTEGER CHECK (nilai >= 1 AND nilai <= 5),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Penilaian
ALTER TABLE public.penilaian_anak ENABLE ROW LEVEL SECURITY;

-- Panitia can insert/update penilaian
CREATE POLICY "Panitia can manage penilaian"
ON public.penilaian_anak FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.role IN ('panitia', 'admin_utama')
    )
);

-- Anak can view their own penilaian
CREATE POLICY "Anak can view own penilaian"
ON public.penilaian_anak FOR SELECT
USING (auth.uid() = user_id);

-- =============================================
-- UPDATE RLS: Allow panitia to view all attendance logs
-- =============================================
CREATE POLICY "Panitia can view all logs"
ON public.attendance_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.role IN ('panitia', 'admin_utama')
    )
);

-- Allow panitia to insert users (for tambah jamaah)
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
