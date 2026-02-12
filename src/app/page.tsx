'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowRight, BookOpen, QrCode, ClipboardList, LogOut, Loader2, User, Calendar, Clock, Newspaper, ChevronRight, Star, LogIn } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';

type Kajian = {
  kajian_id: string;
  tanggal: string;
  hari: string;
  hijriah: string;
  pemateri: string;
  tema: string;
  foto_pemateri?: string;
};

type Berita = {
  news_id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [kajianList, setKajianList] = useState<Kajian[]>([]);
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [hasMoreKajian, setHasMoreKajian] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data: profileData } = await supabase
          .from('users')
          .select('nama, role')
          .eq('user_id', authUser.id)
          .single();
        setProfile(profileData);
      }

      // Fetch kajian - get 4 to check if there are more
      const today = new Date().toISOString().split('T')[0];
      const { data: kajianData } = await supabase
        .from('kajian_subuh')
        .select('*')
        .gte('tanggal', today)
        .eq('is_active', true)
        .order('tanggal', { ascending: true })
        .limit(4);

      if (kajianData) {
        setHasMoreKajian(kajianData.length > 3);
        setKajianList(kajianData.slice(0, 3));
      }

      // Fetch berita - only 2
      const { data: beritaData } = await supabase
        .from('warta_berita')
        .select('news_id, title, content, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      if (beritaData) {
        setBeritaList(beritaData);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-islamic-pattern">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          {user && profile ? (
            <>
              <span className="text-sm font-medium hidden sm:inline">{profile.nama}</span>
              <button onClick={handleLogout} className="btn-ghost text-sm px-3 py-1.5 flex items-center gap-1">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            <Link href="/register" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
              <LogIn className="w-4 h-4" />
              Masuk
            </Link>
          )}
        </div>
      </div>

      {/* Hero Section with Mosque Image */}
      <div className="relative h-[50vh] min-h-[400px] bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden">
        {/* Placeholder for mosque image - user can replace with actual photo */}
        <div className="absolute inset-0 bg-[url('/logo-ramadhan.png')] bg-center bg-no-repeat bg-contain opacity-10"></div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent"></div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-white px-4 text-center pt-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
            Masjid As Sakinah
          </h1>
          <p className="text-xl md:text-2xl mb-2 opacity-95">
            Pantai Mentari, Surabaya
          </p>
          <p className="text-lg opacity-90 mb-1">
            Ramadhan 1447H
          </p>
          <p className="text-sm opacity-75 max-w-md">
            Program Kajian Subuh, Tarawih, dan Kegiatan Ramadhan
          </p>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-16 fill-background">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-20 -mt-8">
        {user && profile ? (
          <>
            {/* Quick Actions - Role-based */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {profile.role === 'jamaah_dewasa' ? (
                <>
                  <Link href="/dashboard" className="card-elegant flex flex-col items-center py-4 hover:border-amber-500/50 transition shadow-md">
                    <Star className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-[10px] font-medium">Dashboard</span>
                  </Link>
                  <Link href="/card" className="card-elegant flex flex-col items-center py-4 hover:border-primary/50 transition shadow-md">
                    <QrCode className="w-5 h-5 text-primary mb-1" />
                    <span className="text-[10px] font-medium">Kartu</span>
                  </Link>
                  <Link href="/riwayat" className="card-elegant flex flex-col items-center py-4 hover:border-blue-500/50 transition shadow-md">
                    <ClipboardList className="w-5 h-5 text-blue-500 mb-1" />
                    <span className="text-[10px] font-medium">Riwayat</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/card" className="card-elegant flex flex-col items-center py-4 hover:border-primary/50 transition shadow-md">
                    <QrCode className="w-5 h-5 text-primary mb-1" />
                    <span className="text-[10px] font-medium">Kartu</span>
                  </Link>
                  <Link href="/journal" className="card-elegant flex flex-col items-center py-4 hover:border-accent/50 transition shadow-md">
                    <BookOpen className="w-5 h-5 text-accent mb-1" />
                    <span className="text-[10px] font-medium">Jurnal</span>
                  </Link>
                  <Link href="/riwayat" className="card-elegant flex flex-col items-center py-4 hover:border-blue-500/50 transition shadow-md">
                    <ClipboardList className="w-5 h-5 text-blue-500 mb-1" />
                    <span className="text-[10px] font-medium">Riwayat</span>
                  </Link>
                </>
              )}
            </div>

            {['admin_utama', 'panitia', 'admin_media'].includes(profile.role) && (
              <Link href="/admin" className="btn-ghost w-full flex items-center justify-center gap-1 mb-6 text-sm py-2 shadow-sm">
                Dashboard Admin <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </>
        ) : (
          <div className="card-elegant mb-6 py-8 text-center shadow-md">
            <User className="w-12 h-12 text-primary mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">Masuk untuk akses fitur lengkap</p>
            <Link href="/register" className="btn-primary inline-flex items-center gap-1.5 text-sm">
              <LogIn className="w-4 h-4" />
              Masuk ke Akun
            </Link>
          </div>
        )}

        {/* Kajian Subuh - Compact */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Kajian Subuh
            </h2>
            {hasMoreKajian && (
              <Link href="/kajian" className="text-xs text-primary hover:underline flex items-center gap-1">
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          <div className="space-y-2">
            {kajianList.map((k) => (
              <div key={k.kajian_id} className="card-elegant p-3 hover:border-primary/30 transition">
                <div className="flex gap-3">
                  {k.foto_pemateri ? (
                    <img src={k.foto_pemateri} alt={k.pemateri} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{k.hari}, {new Date(k.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {k.hijriah}</p>
                    <p className="font-bold text-sm truncate">{k.pemateri}</p>
                    <p className="text-xs text-muted-foreground truncate">{k.tema}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warta Berita */}
        {beritaList.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-accent" />
                Warta Berita
              </h2>
              <Link href="/warta" className="text-xs text-primary hover:underline flex items-center gap-1">
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {beritaList.map((b) => (
                <div key={b.news_id} className="card-elegant p-3 hover:border-accent/30 transition">
                  <p className="font-bold text-sm mb-1">{b.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{b.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
