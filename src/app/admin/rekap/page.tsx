'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, BarChart3, Filter, Users, Sun } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type AttendanceRecord = {
    user_id: string;
    nama: string;
    role: string;
    total_subuh: number;
    total_tarawih: number;
    total_harian: number;
    total: number;
};

export default function RekapPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [stats, setStats] = useState({ totalJamaah: 0, totalDewasa: 0, totalAnak: 0 });

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const checkAuthAndFetch = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/register'); return; }

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (!profile || !['panitia', 'admin_utama'].includes(profile.role)) {
            router.push('/admin');
            return;
        }

        // Fetch all jamaah
        const { data: users } = await supabase
            .from('users')
            .select('user_id, nama, role')
            .in('role', ['jamaah_dewasa', 'jamaah_anak'])
            .order('nama');

        // Fetch all attendance logs
        const { data: logs } = await supabase
            .from('attendance_logs')
            .select('user_id, session_type')
            .eq('is_valid', true);

        // Build records
        const userMap = new Map<string, AttendanceRecord>();
        (users || []).forEach(u => {
            userMap.set(u.user_id, {
                user_id: u.user_id,
                nama: u.nama,
                role: u.role,
                total_subuh: 0,
                total_tarawih: 0,
                total_harian: 0,
                total: 0,
            });
        });

        (logs || []).forEach(log => {
            const record = userMap.get(log.user_id);
            if (record) {
                if (log.session_type === 'subuh') record.total_subuh++;
                else if (log.session_type === 'tarawih') record.total_tarawih++;
                else if (log.session_type === 'kegiatan_harian') record.total_harian++;
                record.total++;
            }
        });

        const allRecords = Array.from(userMap.values()).sort((a, b) => b.total - a.total);
        setRecords(allRecords);

        const totalDewasa = (users || []).filter(u => u.role === 'jamaah_dewasa').length;
        const totalAnak = (users || []).filter(u => u.role === 'jamaah_anak').length;
        setStats({ totalJamaah: (users || []).length, totalDewasa, totalAnak });
        setLoading(false);
    };

    const filteredRecords = filterRole === 'all'
        ? records
        : records.filter(r => r.role === filterRole);

    if (loading) return (
        <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-lg mx-auto p-6 pb-24">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-rose-500" />
                            Rekap Kehadiran
                        </h1>
                        <p className="text-sm text-muted-foreground">Data presensi jamaah</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="card-elegant text-center py-3">
                        <p className="text-2xl font-bold text-primary">{stats.totalJamaah}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total</p>
                    </div>
                    <div className="card-elegant text-center py-3">
                        <p className="text-2xl font-bold text-blue-500">{stats.totalDewasa}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Dewasa</p>
                    </div>
                    <div className="card-elegant text-center py-3">
                        <p className="text-2xl font-bold text-green-500">{stats.totalAnak}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Anak</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-2">
                        {[
                            { value: 'all', label: 'Semua' },
                            { value: 'jamaah_dewasa', label: 'Dewasa' },
                            { value: 'jamaah_anak', label: 'Anak' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFilterRole(opt.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition",
                                    filterRole === opt.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary hover:bg-muted"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="card-elegant overflow-hidden p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Nama</th>
                                <th className="text-center p-3 font-medium text-muted-foreground text-xs">
                                    <Sun className="w-3 h-3 inline text-blue-400" /> Subuh
                                </th>
                                <th className="text-center p-3 font-medium text-muted-foreground text-xs">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-muted-foreground">
                                        Belum ada data.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((rec, idx) => (
                                    <tr key={rec.user_id} className={cn("border-b border-border/50", idx % 2 === 1 && "bg-secondary/20")}>
                                        <td className="p-3">
                                            <p className="font-medium text-sm">{rec.nama}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {rec.role === 'jamaah_anak' ? 'Anak' : 'Dewasa'}
                                            </p>
                                        </td>
                                        <td className="text-center p-3">
                                            <span className="text-blue-500 font-bold">{rec.total_subuh}</span>
                                        </td>
                                        <td className="text-center p-3">
                                            <span className="font-bold text-primary">{rec.total}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
