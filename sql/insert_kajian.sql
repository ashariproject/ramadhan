-- Jalankan SQL ini di Supabase SQL Editor untuk membuat tabel kajian_subuh

-- 1. Buat tabel
create table if not exists public.kajian_subuh (
    kajian_id uuid primary key default uuid_generate_v4(),
    tanggal date not null,
    hari text not null,
    hijriah text,
    pemateri text not null,
    tema text not null,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.kajian_subuh enable row level security;

-- 3. Policy: Anyone can view
create policy "Anyone can view kajian"
on public.kajian_subuh for select
using (true);

-- 4. Policy: Admins can manage
create policy "Admins can manage kajian"
on public.kajian_subuh for all
using (
    exists (
        select 1 from public.users
        where users.user_id = auth.uid()
        and users.role in ('admin_utama', 'panitia')
    )
);

-- 5. Insert data kajian Ramadhan 1447H (2026)
-- Ramadhan 2026 dimulai sekitar 28 Feb 2026
insert into public.kajian_subuh (tanggal, hari, hijriah, pemateri, tema) values
('2026-02-28', 'SABTU', '1 Ramadhan 1447 H', 'Ust. Marzuki Imron, ST', 'HIKMAH SURAH AL-''ASR'),
('2026-03-01', 'AHAD', '2 Ramadhan 1447 H', 'Ust. M. Junaidi Sahal, M.Ag', 'BERKAH DENGAN 6 KURIKULUM RAMADHAN'),
('2026-03-02', 'SENIN', '3 Ramadhan 1447 H', 'Dr. Muhammad Yahya, Ph.D', 'TAFSIR AYAT PUASA (AL-BAQARAH 182-187)'),
('2026-03-03', 'SELASA', '4 Ramadhan 1447 H', 'Habib Ubaidillah bin Eidrus Al Habsy', 'PUASA YANG BERKUALITAS'),
('2026-03-04', 'RABU', '5 Ramadhan 1447 H', 'Habib Musthofa bin Umar Al Aydrus', 'CINTA ALLAH & RASUL TANPA MELIHAT DALIL'),
('2026-03-05', 'KAMIS', '6 Ramadhan 1447 H', 'KH. Ma''ruf Khozin', 'PUASA BAGI MUSAFIR, ORANG SAKIT & WANITA HAMIL'),
('2026-03-06', 'JUM''AT', '7 Ramadhan 1447 H', 'Prof. Dr. Menachem Ali', 'POLEMIK NASAB NABI DALAM TRADISI ISLAM & KRISTEN'),
('2026-03-07', 'SABTU', '8 Ramadhan 1447 H', 'Ust. Bambang Heri Latief, SE', 'MENGAPA MASIH ADA MAKSIAT?'),
('2026-03-08', 'AHAD', '9 Ramadhan 1447 H', 'Letkol (L) H. Enjang Juaeni Zein, S.Ag', 'BAGAIMANA AMAL TAUHID ?!'),
('2026-03-09', 'SENIN', '10 Ramadhan 1447 H', 'Ust. Heru Kusumahadi, Lc., M.Pd.I', 'MENIKMATI PESAN TIDUR'),
('2026-03-10', 'SELASA', '11 Ramadhan 1447 H', 'Ust. M. Sholeh Drehem, Lc., M.Ag', 'MUKMIN ITU HARUS KUAT'),
('2026-03-11', 'RABU', '12 Ramadhan 1447 H', 'Ust. Ardhyansah, SHI', 'WASIAT RASULULLAH TENTANG PENYAKIT UMAT TERDAHULU'),
('2026-03-12', 'KAMIS', '13 Ramadhan 1447 H', 'Ust. H. M. Husni Mubarak, M.Ag Al-Hafidz', 'PUASA TAPI SIA - SIA'),
('2026-03-13', 'JUM''AT', '14 Ramadhan 1447 H', 'Dr. Nur Kholis Majid, M. HI', 'PEDOMAN LENGKAP I''TIKAF'),
('2026-03-14', 'SABTU', '15 Ramadhan 1447 H', 'Ust. Marzuki Imron, ST', 'KARAKTERISTIK PEMIMPIN MENURUT RASULULLAH'),
('2026-03-15', 'AHAD', '16 Ramadhan 1447 H', 'Drs. H. Muhammad Taufiq AB', 'ZAKAT DI BULAN AL - QUR''AN'),
('2026-03-16', 'SENIN', '17 Ramadhan 1447 H', 'Dr. Muhammad Yahya, Ph.D', 'TANDA IMAN'),
('2026-03-17', 'SELASA', '18 Ramadhan 1447 H', 'Dr. Nur Kholis Majid, M. HI', 'KEMUKJIZATAN AL - QUR''AN'),
('2026-03-18', 'RABU', '19 Ramadhan 1447 H', 'Ust. H. A. Muzakki, S. Ag', 'MENJAGA HATI MEMPERTAHANKAN PRESTASI'),
('2026-03-19', 'KAMIS', '20 Ramadhan 1447 H', 'KH. Ma''ruf Khozin', 'MEMAHAMI KANDUNGAN AL-QUR''AN'),
('2026-03-20', 'JUM''AT', '21 Ramadhan 1447 H', 'Prof. Dr. Menachem Ali', 'QUR''AN KITAB SEJARAH DAN OTENTIK'),
('2026-03-21', 'SABTU', '22 Ramadhan 1447 H', 'Ust. Bambang Heri Latief, SE', 'BAHAGIA BISA TAAT'),
('2026-03-22', 'AHAD', '23 Ramadhan 1447 H', 'Ust. Anwar Musyaddat, S. Si', 'FIQIH SHALAT TAHAJUD'),
('2026-03-23', 'SENIN', '24 Ramadhan 1447 H', 'Ir. H. Misbahul Huda, MBA', 'PRAKTEK PENGAMALAN ISLAM'),
('2026-03-24', 'SELASA', '25 Ramadhan 1447 H', 'Dr. H. Syarif Thayib, S.Ag., M.Si', 'LAILATUL QADAR SETIAP MALAM'),
('2026-03-25', 'RABU', '26 Ramadhan 1447 H', 'Dr. H. Ilhamullah Sumarkhan, M.Ag', 'PELAJARAN CINTA DALAM BERPUASA'),
('2026-03-26', 'KAMIS', '27 Ramadhan 1447 H', 'Ust. Akhmad Arqom, M. Sos', 'DAMPAK MEMBURUKNYA HUBUNGAN KITA DENGAN AL-QUR''AN'),
('2026-03-27', 'JUM''AT', '28 Ramadhan 1447 H', 'Ust. M. Ali Misbahul Munir, Lc., M.Th.I', 'RAHASIA SUKSES NABI DI KOTA MADINAH'),
('2026-03-28', 'SABTU', '29 Ramadhan 1447 H', 'Ust. M. Junaidi Sahal, M.Ag', 'MALAM TERAKHIR RAMADHAN');
