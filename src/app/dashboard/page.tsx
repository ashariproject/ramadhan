'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-qr-code';
import { Loader2, LogOut, Sun, Trophy, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const TARGET_SUBUH = 30; // Target kehadiran Kajian Subuh

export default function DashboardDewasa() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [subuhCount, setSubuhCount] = useState(0);
    const [attendanceDates, setAttendanceDates] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/register'); return; }

            const { data: profileData } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!profileData) { router.push('/register'); return; }
            // If role is anak, redirect to journal
            if (profileData.role === 'jamaah_anak') { router.push('/journal'); return; }
            // If role is panitia/admin, redirect to admin
            if (['panitia', 'admin_utama', 'admin_media'].includes(profileData.role)) { router.push('/admin'); return; }

            setProfile(profileData);

            // Fetch Subuh attendance
            const { data: logs } = await supabase
                .from('attendance_logs')
                .select('scanned_at')
                .eq('user_id', user.id)
                .eq('session_type', 'subuh')
                .eq('is_valid', true);

            const dates = (logs || []).map(l => new Date(l.scanned_at).toISOString().split('T')[0]);
            const uniqueDates = [...new Set(dates)];
            setSubuhCount(uniqueDates.length);
            setAttendanceDates(uniqueDates);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/register');
    };

    if (loading) return (
        <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    if (!profile) return null;

    const progressPercent = Math.min((subuhCount / TARGET_SUBUH) * 100, 100);

    // Generate 30-day grid
    const ramadhanStart = new Date('2026-02-18'); // 1 Ramadhan 1447H
    const dayGrid = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(ramadhanStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isPresent = attendanceDates.includes(dateStr);
        const isPast = date < new Date();
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        return { day: i + 1, dateStr, isPresent, isPast, isToday };
    });

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-lg mx-auto p-6 pb-24">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold font-heading">Ahlan, {profile.nama}</h1>
                        <p className="text-sm text-muted-foreground">Semoga ibadahmu diterima</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button onClick={handleLogout} className="p-2 rounded-full bg-secondary hover:bg-destructive/20 transition">
                            <LogOut className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Umroh Prize Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-6 mb-6 text-white shadow-lg">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-6 h-6" />
                            <span className="text-sm font-bold uppercase tracking-widest">Hadiah Umroh</span>
                        </div>
                        <p className="text-white/80 text-sm mb-4">
                            Hadiri Kajian Subuh setiap hari selama Ramadhan untuk berkesempatan mendapatkan hadiah Umroh!
                        </p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-bold">{subuhCount}</span>
                                <span className="text-sm text-white/80">/ {TARGET_SUBUH} hari</span>
                            </div>
                            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-white/60 mt-2 text-right">
                                {progressPercent.toFixed(0)}% tercapai
                            </p>
                        </div>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="card-elegant text-center mb-6">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center justify-center gap-2">
                        <Sun className="w-4 h-4 text-primary" />
                        QR Code Absensi
                    </h3>
                    <div className="inline-block p-3 bg-white rounded-xl border-4 border-primary/20 shadow-sm">
                        <QRCode
                            value={profile.qr_code_token || 'INVALID'}
                            size={140}
                            level="H"
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 font-mono tracking-widest">
                        {profile.qr_code_token?.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                        Tunjukkan QR ini ke panitia saat kajian
                    </p>
                </div>

                {/* Attendance Calendar Grid */}
                <div className="card-elegant mb-6">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Kehadiran Kajian Subuh
                    </h3>
                    <div className="grid grid-cols-10 gap-1.5">
                        {dayGrid.map((day) => (
                            <div
                                key={day.day}
                                className={cn(
                                    "aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all",
                                    day.isPresent
                                        ? "bg-green-500 text-white shadow-sm shadow-green-500/30"
                                        : day.isToday
                                            ? "bg-primary/20 text-primary border-2 border-primary/50"
                                            : day.isPast
                                                ? "bg-red-500/10 text-red-400/60"
                                                : "bg-secondary text-muted-foreground"
                                )}
                                title={day.dateStr}
                            >
                                {day.day}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-500" /> Hadir</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500/10 border border-red-400/30" /> Tidak Hadir</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-secondary border border-border" /> Belum</span>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-2">
                    <Link href="/warta" className="card-elegant flex items-center justify-between hover:border-primary/30 transition">
                        <span className="text-sm font-medium">📰 Warta As Sakinah</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
