'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Star, CheckSquare, BookOpen, Flame, ArrowLeft, Award, Sun, Moon as MoonIcon, Zap, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
    calculateJournalPoints,
    calculateAttendancePoints,
    calculateStreak,
    getStreakBonus,
    getStreakMilestones,
    getBadge,
    getNextBadge,
    getDailyQuote,
    JournalEntry,
    AttendanceLog,
    POINT_VALUES,
    BADGES,
} from '@/lib/gamification';

export default function JournalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [journal, setJournal] = useState<JournalEntry>({
        puasa: false, sholat_subuh: false, sholat_zuhur: false,
        sholat_ashar: false, sholat_maghrib: false, sholat_isya: false,
        tadarus: false
    });
    const [stats, setStats] = useState({
        totalPoints: 0,
        journalPoints: 0,
        attendancePoints: 0,
        attendanceSubuh: 0,
        attendanceTarawih: 0,
        attendanceHarian: 0,
        streak: 0
    });
    const [saving, setSaving] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                router.push('/register');
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', authUser.id)
                .single();

            // Redirect dewasa to dashboard
            if (profile?.role === 'jamaah_dewasa') { router.push('/dashboard'); return; }
            if (['panitia', 'admin_utama', 'admin_media'].includes(profile?.role)) { router.push('/admin'); return; }

            setUser(profile);

            const today = new Date().toISOString().split('T')[0];
            const { data: journalData } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', authUser.id)
                .eq('date', today)
                .single();

            if (journalData) {
                setJournal(journalData);
            }

            const { data: allJournals } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', authUser.id);

            const { data: allAttendance } = await supabase
                .from('attendance_logs')
                .select('session_type')
                .eq('user_id', authUser.id)
                .eq('is_valid', true);

            const jPoints = (allJournals || []).reduce((acc, entry) => acc + calculateJournalPoints(entry), 0);
            const aPoints = calculateAttendancePoints((allAttendance || []) as AttendanceLog[]);

            // Calculate streak
            const journalDates = (allJournals || []).map((j: any) => j.date);
            const streak = calculateStreak(journalDates);
            const streakBonus = getStreakBonus(streak);

            const attendanceSubuh = (allAttendance || []).filter(a => a.session_type === 'subuh').length;
            const attendanceTarawih = (allAttendance || []).filter(a => a.session_type === 'tarawih').length;
            const attendanceHarian = (allAttendance || []).filter(a => a.session_type === 'kegiatan_harian').length;

            setStats({
                totalPoints: jPoints + aPoints + streakBonus,
                journalPoints: jPoints,
                attendancePoints: aPoints,
                attendanceSubuh,
                attendanceTarawih,
                attendanceHarian,
                streak
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCheck = async (field: keyof JournalEntry) => {
        if (!user) return;
        setSaving(true);

        const newValue = !journal[field];
        const newJournal = { ...journal, [field]: newValue };
        setJournal(newJournal);

        // Celebration on check!
        if (newValue) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 1200);
        }

        const today = new Date().toISOString().split('T')[0];

        const { error } = await supabase
            .from('journal_entries')
            .upsert({
                user_id: user.user_id,
                date: today,
                ...newJournal
            }, { onConflict: 'user_id, date' });

        if (error) {
            console.error("Save failed", error);
            setJournal(journal);
        } else {
            fetchData();
        }
        setSaving(false);
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

    const badge = getBadge(stats.totalPoints);
    const nextBadge = getNextBadge(stats.totalPoints);
    const progress = nextBadge
        ? ((stats.totalPoints - badge.minParams) / (nextBadge.minParams - badge.minParams)) * 100
        : 100;
    const streakMilestones = getStreakMilestones(stats.streak);

    return (
        <div className="min-h-screen bg-islamic-pattern">
            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="animate-bounce text-6xl">✨</div>
                    <div className="absolute animate-ping text-4xl" style={{ top: '30%', left: '20%' }}>⭐</div>
                    <div className="absolute animate-ping text-4xl" style={{ top: '25%', right: '25%', animationDelay: '0.2s' }}>🌟</div>
                    <div className="absolute animate-ping text-3xl" style={{ bottom: '40%', left: '30%', animationDelay: '0.4s' }}>💫</div>
                </div>
            )}

            <div className="max-w-lg mx-auto p-6 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Jurnal Ramadhan 📝</h1>
                            <p className="text-sm text-muted-foreground">Halo, {user?.nama}! 👋</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button onClick={handleLogout} className="p-2 rounded-full bg-secondary hover:bg-destructive/20 transition">
                            <LogOut className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Points & Streak Banner */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="card-elegant text-center bg-gradient-to-br from-primary/10 to-accent/10 py-4">
                        <Star className="w-6 h-6 text-primary fill-primary mx-auto mb-1" />
                        <p className="text-2xl font-bold text-primary">{stats.totalPoints}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Poin</p>
                    </div>
                    <div className="card-elegant text-center bg-gradient-to-br from-orange-500/10 to-red-500/10 py-4">
                        <div className="text-2xl mb-1">{stats.streak > 0 ? '🔥' : '❄️'}</div>
                        <p className="text-2xl font-bold text-orange-500">{stats.streak}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Hari Streak</p>
                    </div>
                </div>

                {/* Badge Card - Playful */}
                <div className={cn("card-elegant text-center mb-6 bg-gradient-to-br", badge.bg)}>
                    <div className="text-6xl mb-2 animate-bounce" style={{ animationDuration: '2s' }}>{badge.icon}</div>
                    <h2 className={cn("text-xl font-bold mb-1", badge.color)}>{badge.name}</h2>

                    {nextBadge ? (
                        <>
                            <p className="text-xs text-muted-foreground mb-3">
                                Kurang <span className="font-bold text-primary">{nextBadge.minParams - stats.totalPoints}</span> poin lagi untuk jadi {nextBadge.icon} {nextBadge.name}!
                            </p>
                            <div className="relative h-3 bg-secondary rounded-full overflow-hidden w-full max-w-[220px] mx-auto">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">{stats.totalPoints} / {nextBadge.minParams} poin</p>
                        </>
                    ) : (
                        <p className="text-sm text-amber-500 font-medium">🎉 Level Maksimal! Kamu luar biasa!</p>
                    )}
                </div>

                {/* Streak Milestones */}
                <div className="card-elegant mb-6">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        Streak Milestones
                    </h3>
                    <div className="flex justify-between">
                        {streakMilestones.map((m, i) => (
                            <div
                                key={m.days}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-all",
                                    m.reached ? "scale-110" : "opacity-40"
                                )}
                            >
                                <div className={cn(
                                    "text-xl",
                                    m.reached && "animate-bounce"
                                )} style={{ animationDelay: `${i * 0.1}s`, animationDuration: '2s' }}>
                                    {m.emoji}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold",
                                    m.reached ? "text-orange-500" : "text-muted-foreground"
                                )}>
                                    {m.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance Stats */}
                <div className="card-elegant mb-6">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        Kehadiran Saya
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-sky-500/10 rounded-xl p-3 text-center">
                            <Sun className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                            <p className="text-xl font-bold text-sky-500">{stats.attendanceSubuh}</p>
                            <p className="text-[10px] text-muted-foreground">Subuh</p>
                        </div>
                        <div className="bg-orange-500/10 rounded-xl p-3 text-center">
                            <BookOpen className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                            <p className="text-xl font-bold text-orange-500">{stats.attendanceHarian}</p>
                            <p className="text-[10px] text-muted-foreground">Kegiatan</p>
                        </div>
                        <div className="bg-violet-500/10 rounded-xl p-3 text-center">
                            <MoonIcon className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                            <p className="text-xl font-bold text-violet-500">{stats.attendanceTarawih}</p>
                            <p className="text-[10px] text-muted-foreground">Tarawih</p>
                        </div>
                    </div>
                </div>

                {/* Daily Motivation */}
                <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-sm italic text-foreground">"{getDailyQuote()}"</p>
                </div>

                {/* All Badges Preview */}
                <div className="card-elegant mb-6">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        Koleksi Badge
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {BADGES.map((b) => {
                            const unlocked = stats.totalPoints >= b.minParams;
                            return (
                                <div
                                    key={b.name}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                                        unlocked ? "bg-gradient-to-br " + b.bg : "bg-secondary/50 opacity-30 grayscale"
                                    )}
                                >
                                    <span className="text-2xl">{b.icon}</span>
                                    <span className={cn("text-[9px] font-bold text-center", unlocked ? b.color : "text-muted-foreground")}>
                                        {b.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Checklist */}
                <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                    <CheckSquare className="w-5 h-5 text-accent" />
                    Ceklist Hari Ini ✅
                </h3>

                <div className="space-y-3">
                    {/* Puasa */}
                    <CheckItem
                        label="Puasa Hari Ini"
                        emoji="🍽️"
                        icon={<Flame className="w-5 h-5 text-orange-500" />}
                        checked={journal.puasa}
                        onClick={() => toggleCheck('puasa')}
                        points={POINT_VALUES.JOURNAL.PUASA}
                    />

                    {/* Sholat Wajib */}
                    <div className="card-elegant">
                        <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                            🕌 Sholat 5 Waktu
                        </h4>
                        <div className="grid grid-cols-5 gap-2">
                            <MiniCheck label="Subuh" emoji="🌅" checked={journal.sholat_subuh} onClick={() => toggleCheck('sholat_subuh')} />
                            <MiniCheck label="Zuhur" emoji="☀️" checked={journal.sholat_zuhur} onClick={() => toggleCheck('sholat_zuhur')} />
                            <MiniCheck label="Ashar" emoji="🌤️" checked={journal.sholat_ashar} onClick={() => toggleCheck('sholat_ashar')} />
                            <MiniCheck label="Maghrib" emoji="🌅" checked={journal.sholat_maghrib} onClick={() => toggleCheck('sholat_maghrib')} />
                            <MiniCheck label="Isya" emoji="🌙" checked={journal.sholat_isya} onClick={() => toggleCheck('sholat_isya')} />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center mt-2">+{POINT_VALUES.JOURNAL.SHOLAT} poin per sholat ⭐</p>
                    </div>

                    {/* Tadarus */}
                    <CheckItem
                        label="Membaca Al-Quran / Iqra"
                        emoji="📖"
                        icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
                        checked={journal.tadarus}
                        onClick={() => toggleCheck('tadarus')}
                        points={POINT_VALUES.JOURNAL.TADARUS}
                    />
                </div>
            </div>
        </div>
    );
}

function CheckItem({ label, emoji, icon, checked, onClick, points }: { label: string, emoji: string, icon: any, checked: boolean, onClick: () => void, points?: number }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "card-elegant flex items-center justify-between cursor-pointer transition-all duration-300 active:scale-[0.96]",
                checked && "border-accent/50 bg-gradient-to-r from-accent/10 to-emerald-500/5 shadow-md shadow-accent/10"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "text-2xl transition-transform duration-300",
                    checked && "scale-125"
                )}>
                    {checked ? '✅' : emoji}
                </div>
                <div>
                    <span className={cn("font-medium", checked && "text-accent")}>{label}</span>
                    {points && <p className="text-[10px] text-muted-foreground">+{points} poin ⭐</p>}
                </div>
            </div>
            <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                checked ? "bg-accent border-accent scale-110" : "border-muted-foreground"
            )}>
                {checked && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
        </div>
    );
}

function MiniCheck({ label, emoji, checked, onClick }: { label: string, emoji: string, checked: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-300 active:scale-90",
                checked ? "bg-accent/15 border border-accent/30 shadow-sm shadow-accent/10" : "bg-secondary border border-transparent hover:bg-muted"
            )}
        >
            <span className={cn(
                "text-lg transition-all duration-300",
                checked ? "scale-125" : "grayscale opacity-60"
            )}>
                {checked ? '✅' : emoji}
            </span>
            <span className={cn(
                "text-[10px] mt-1 font-medium",
                checked ? "text-accent" : "text-muted-foreground"
            )}>{label}</span>
        </div>
    );
}
