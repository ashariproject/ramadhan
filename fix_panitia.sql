-- =============================================
-- FIX: Database Error Querying Schema
-- Masalah: RLS policy self-referencing di tabel users
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. Hapus policy bermasalah
DROP POLICY IF EXISTS "Panitia can insert users" ON public.users;

-- 2. Buat policy insert yang aman (tanpa self-reference)
CREATE POLICY "Anyone can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Tambah policy agar panitia bisa baca semua users
DROP POLICY IF EXISTS "Panitia can view all users" ON public.users;
CREATE POLICY "Panitia can view all users"
ON public.users FOR SELECT
USING (true);

-- 4. Verifikasi: cek data panitia
SELECT user_id, nama, no_wa, role FROM public.users WHERE no_wa LIKE 'panitia%';
