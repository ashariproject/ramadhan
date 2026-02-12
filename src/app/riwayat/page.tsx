'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

type AttendanceLog = {
    log_id: string;
    session_type: string;
    scanned_at: string;
    is_valid: boolean;
};

export default function RiwayatPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ subuh: 0, kegiatan_harian: 0, tarawih: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/register');
                return;
            }

            const { data: profileData } = await supabase
                .from('users')
                .select('nama, role')
                .eq('user_id', user.id)
                .single();

            setProfile(profileData);

            const { data: logsData, error } = await supabase
                .from('attendance_logs')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_valid', true)
                .order('scanned_at', { ascending: false });

            if (error) throw error;
            setLogs(logsData || []);

            // Calculate stats
            const subuh = logsData?.filter(l => l.session_type === 'subuh').length || 0;
            const kegiatan_harian = logsData?.filter(l => l.session_type === 'kegiatan_harian').length || 0;
            const tarawih = logsData?.filter(l => l.session_type === 'tarawih').length || 0;
            setStats({ subuh, kegiatan_harian, tarawih });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sessionLabels: Record<string, string> = {
        subuh: 'Kajian Subuh',
        kegiatan_harian: 'Kegiatan Harian',
        tarawih: 'Tarawih'
    };

    const sessionColors: Record<string, string> = {
        subuh: 'bg-blue-500/10 text-blue-500',
        kegiatan_harian: 'bg-orange-500/10 text-orange-500',
        tarawih: 'bg-purple-500/10 text-purple-500'
    };

    if (loading) return (
        <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-lg mx-auto p-6 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/card" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Riwayat Kehadiran</h1>
                            <p className="text-sm text-muted-foreground">{profile?.nama}</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="card-elegant text-center py-4">
                        <p className="text-2xl font-bold text-blue-500">{stats.subuh}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Subuh</p>
                    </div>
                    <div className="card-elegant text-center py-4">
                        <p className="text-2xl font-bold text-orange-500">{stats.kegiatan_harian}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Harian</p>
                    </div>
                    <div className="card-elegant text-center py-4">
                        <p className="text-2xl font-bold text-purple-500">{stats.tarawih}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Tarawih</p>
                    </div>
                </div>

                {/* Log List */}
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Detail Kehadiran
                </h3>

                {logs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Belum ada riwayat kehadiran.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {logs.map(log => (
                            <div key={log.log_id} className="card-elegant flex items-center justify-between py-3 px-4">
                                <div>
                                    <p className="font-medium text-sm">
                                        {new Date(log.scanned_at).toLocaleDateString('id-ID', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(log.scanned_at).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <span className={cn("text-xs font-medium px-2 py-1 rounded-full", sessionColors[log.session_type])}>
                                    {sessionLabels[log.session_type] || log.session_type}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
