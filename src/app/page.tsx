'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowRight, BookOpen, QrCode, ClipboardList, LogOut, Loader2, User, Calendar, Clock, Newspaper, ChevronRight } from "lucide-react";
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
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-lg mx-auto p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-4 pt-2">
          <img src="/logo-ramadhan.png" alt="Ramadhan 1447H" className="w-40 sm:w-52 mx-auto" />
        </div>

        {user && profile ? (
          <>
            {/* User Card - Compact */}
            <div className="card-elegant mb-4 flex items-center gap-3 py-3">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{profile.nama}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions - Compact */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Link href="/card" className="card-elegant flex flex-col items-center py-4 hover:border-primary/50 transition">
                <QrCode className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] font-medium">Kartu</span>
              </Link>
              <Link href="/journal" className="card-elegant flex flex-col items-center py-4 hover:border-accent/50 transition">
                <BookOpen className="w-5 h-5 text-accent mb-1" />
                <span className="text-[10px] font-medium">Jurnal</span>
              </Link>
              <Link href="/riwayat" className="card-elegant flex flex-col items-center py-4 hover:border-blue-500/50 transition">
                <ClipboardList className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium">Riwayat</span>
              </Link>
            </div>

            {['admin_utama', 'panitia', 'admin_media'].includes(profile.role) && (
              <Link href="/admin" className="btn-ghost w-full flex items-center justify-center gap-1 mb-4 text-sm py-2">
                Dashboard Admin <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </>
        ) : (
          <div className="card-elegant mb-4 py-6 text-center">
            <User className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-3">Masuk untuk akses fitur lengkap</p>
            <Link href="/register" className="btn-primary inline-flex items-center gap-1 text-sm">
              Daftar / Masuk <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Kajian Subuh - Compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" /> Kajian Subuh
            </h2>
            {hasMoreKajian && (
              <Link href="/kajian" className="text-[10px] text-primary flex items-center gap-0.5 hover:underline">
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
          {kajianList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Belum ada jadwal</p>
          ) : (
            <div className="space-y-1.5">
              {kajianList.map((item) => (
                <div key={item.kajian_id} className="card-elegant py-2 px-3 flex items-center gap-3">
                  <div className="text-center shrink-0 w-12 flex flex-col items-center gap-1">
                    {item.foto_pemateri ? (
                      <img src={item.foto_pemateri} alt={item.pemateri} className="w-10 h-10 rounded-full object-cover bg-secondary border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {item.pemateri.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] text-muted-foreground">{item.hari}, {new Date(item.tanggal).getDate()}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.tema}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.pemateri}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Berita - Compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm flex items-center gap-1">
              <Newspaper className="w-4 h-4 text-primary" /> Berita
            </h2>
            <Link href="/warta" className="text-[10px] text-primary flex items-center gap-0.5 hover:underline">
              Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {beritaList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Belum ada berita</p>
          ) : (
            <div className="space-y-1.5">
              {beritaList.map((berita) => (
                <div key={berita.news_id} className="card-elegant py-2 px-3">
                  <p className="text-xs font-medium truncate">{berita.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{berita.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">&copy; 1447H Masjid As Sakinah</p>
      </div>
    </div>
  );
}
