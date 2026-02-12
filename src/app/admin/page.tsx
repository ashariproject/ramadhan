'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, UserPlus, Scan, ClipboardEdit, QrCode, BarChart3, ArrowLeft, LogOut, BookOpen, Newspaper, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [panitiaName, setPanitiaName] = useState('');
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/register');
            return;
        }

        const { data: profile } = await supabase
            .from('users')
            .select('role, nama')
            .eq('user_id', user.id)
            .single();

        if (!profile || !['admin_utama', 'panitia', 'admin_media'].includes(profile.role)) {
            setUnauthorized(true);
            setLoading(false);
            return;
        }

        setPanitiaName(profile.nama);
        setLoading(false);
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

    if (unauthorized) {
        return (
            <div className="min-h-screen bg-islamic-pattern flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <BarChart3 className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
                <p className="text-muted-foreground mb-6">
                    Halaman ini hanya untuk Panitia.
                </p>
                <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
            </div>
        );
    }

    const menuItems = [
        {
            href: '/admin/tambah',
            icon: <UserPlus className="w-8 h-8" />,
            label: 'Tambah Jamaah',
            desc: 'Daftarkan jamaah baru',
            color: 'from-emerald-500 to-green-600',
            iconColor: 'text-emerald-100'
        },
        {
            href: '/scan',
            icon: <Scan className="w-8 h-8" />,
            label: 'Scan Absensi',
            desc: 'Scan QR kehadiran',
            color: 'from-amber-500 to-orange-600',
            iconColor: 'text-amber-100'
        },
        {
            href: '/admin/penilaian',
            icon: <ClipboardEdit className="w-8 h-8" />,
            label: 'Penilaian Anak',
            desc: 'Beri catatan & nilai',
            color: 'from-blue-500 to-indigo-600',
            iconColor: 'text-blue-100'
        },
        {
            href: '/admin/cetak',
            icon: <QrCode className="w-8 h-8" />,
            label: 'Cetak Kartu QR',
            desc: 'Cari & print kartu',
            color: 'from-purple-500 to-violet-600',
            iconColor: 'text-purple-100'
        },
        {
            href: '/admin/rekap',
            icon: <BarChart3 className="w-8 h-8" />,
            label: 'Rekap Kehadiran',
            desc: 'Lihat data presensi',
            color: 'from-rose-500 to-pink-600',
            iconColor: 'text-rose-100'
        },
        {
            href: '/admin/kajian',
            icon: <BookOpen className="w-8 h-8" />,
            label: 'Kelola Kajian',
            desc: 'Edit jadwal kajian',
            color: 'from-teal-500 to-cyan-600',
            iconColor: 'text-teal-100'
        },
        {
            href: '/admin/warta/create',
            icon: <Newspaper className="w-8 h-8" />,
            label: 'Kelola Warta',
            desc: 'Posting berita',
            color: 'from-orange-500 to-red-600',
            iconColor: 'text-orange-100'
        },
        {
            href: '/admin/users',
            icon: <Users className="w-8 h-8" />,
            label: 'Kelola User',
            desc: 'Lihat semua jamaah',
            color: 'from-slate-500 to-gray-600',
            iconColor: 'text-slate-100'
        },
    ];

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-lg mx-auto p-6 pb-24">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold font-heading">Panel Panitia</h1>
                            <p className="text-sm text-muted-foreground">Ahlan, {panitiaName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full bg-secondary hover:bg-destructive/20 transition text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Greeting Card */}
                <div className="card-elegant text-center mb-8 bg-gradient-to-br from-primary/10 to-accent/10">
                    <p className="text-sm italic text-muted-foreground">
                        "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">— HR. Ahmad</p>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group relative overflow-hidden rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            style={{ minHeight: '140px' }}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-90 group-hover:opacity-100 transition-opacity`} />

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`${item.iconColor} drop-shadow-md`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{item.label}</p>
                                    <p className="text-[10px] text-white/70 mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}
