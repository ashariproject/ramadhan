'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Clock, Search } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

type AttendanceLog = {
    log_id: string;
    user_id: string;
    session_type: string;
    scanned_at: string;
    is_valid: boolean;
};

type UserProfile = {
    user_id: string;
    nama: string;
    no_wa: string;
};

type SessionFilter = 'all' | 'subuh' | 'kegiatan_harian' | 'tarawih';

export default function AdminAttendancePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [users, setUsers] = useState<Record<string, UserProfile>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');
    const [stats, setStats] = useState({ total: 0, subuh: 0, kegiatan_harian: 0, tarawih: 0 });
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const checkAuthAndFetch = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/register');
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (!profile || !['admin_utama', 'panitia', 'admin_media'].includes(profile.role)) {
                router.push('/admin');
                return;
            }

            await fetchData();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        // Fetch logs (tanpa join)
        const { data: logsData, error: logsError } = await supabase
            .from('attendance_logs')
            .select('log_id, user_id, session_type, scanned_at, is_valid')
            .eq('is_valid', true)
            .order('scanned_at', { ascending: false })
            .limit(200);

        if (logsError) {
            console.error('Logs Error:', logsError);
            setError('Gagal mengambil data absensi. Pastikan RLS Policy sudah diterapkan.');
            return;
        }

        setLogs(logsData || []);

        // Fetch all users separately
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('user_id, nama, no_wa');

        if (usersError) {
            console.error('Users Error:', usersError);
        } else {
            const usersMap: Record<string, UserProfile> = {};
            usersData?.forEach(u => { usersMap[u.user_id] = u; });
            setUsers(usersMap);
        }

        // Calculate stats
        const total = logsData?.length || 0;
        const subuh = logsData?.filter(l => l.session_type === 'subuh').length || 0;
        const kegiatan_harian = logsData?.filter(l => l.session_type === 'kegiatan_harian').length || 0;
        const tarawih = logsData?.filter(l => l.session_type === 'tarawih').length || 0;
        setStats({ total, subuh, kegiatan_harian, tarawih });
    };

    const sessionLabels: Record<string, string> = {
        subuh: 'Subuh',
        kegiatan_harian: 'Harian',
        tarawih: 'Tarawih'
    };

    const sessionColors: Record<string, string> = {
        subuh: 'bg-blue-500/10 text-blue-500',
        kegiatan_harian: 'bg-orange-500/10 text-orange-500',
        tarawih: 'bg-purple-500/10 text-purple-500'
    };

    const filteredLogs = logs.filter(log => {
        const user = users[log.user_id];
        const matchesSearch = !searchTerm ||
            user?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.no_wa.includes(searchTerm);
        const matchesSession = sessionFilter === 'all' || log.session_type === sessionFilter;
        return matchesSearch && matchesSession;
    });

    if (loading) return (
        <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-2xl mx-auto p-6 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Laporan Kehadiran</h1>
                            <p className="text-sm text-muted-foreground">{stats.total} Total Scan</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <button
                        onClick={() => setSessionFilter(sessionFilter === 'subuh' ? 'all' : 'subuh')}
                        className={cn("card-elegant text-center py-3 transition", sessionFilter === 'subuh' && "ring-2 ring-blue-500")}
                    >
                        <p className="text-xl font-bold text-blue-500">{stats.subuh}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Subuh</p>
                    </button>
                    <button
                        onClick={() => setSessionFilter(sessionFilter === 'kegiatan_harian' ? 'all' : 'kegiatan_harian')}
                        className={cn("card-elegant text-center py-3 transition", sessionFilter === 'kegiatan_harian' && "ring-2 ring-orange-500")}
                    >
                        <p className="text-xl font-bold text-orange-500">{stats.kegiatan_harian}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Harian</p>
                    </button>
                    <button
                        onClick={() => setSessionFilter(sessionFilter === 'tarawih' ? 'all' : 'tarawih')}
                        className={cn("card-elegant text-center py-3 transition", sessionFilter === 'tarawih' && "ring-2 ring-purple-500")}
                    >
                        <p className="text-xl font-bold text-purple-500">{stats.tarawih}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Tarawih</p>
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        placeholder="Cari nama atau WA..."
                        className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 focus:border-primary outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Log List */}
                <div className="space-y-2">
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {error ? 'Tidak dapat memuat data.' : 'Tidak ada data kehadiran.'}
                        </div>
                    ) : (
                        filteredLogs.map(log => {
                            const user = users[log.user_id];
                            return (
                                <div key={log.log_id} className="card-elegant flex items-center justify-between py-3 px-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{user?.nama || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{user?.no_wa || '-'}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.scanned_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap", sessionColors[log.session_type])}>
                                        {sessionLabels[log.session_type] || log.session_type}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
