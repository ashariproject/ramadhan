'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, QrCode, Search, User, Printer } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'react-qr-code';

type JamaahUser = {
    user_id: string;
    nama: string;
    no_wa: string;
    gender: string;
    role: string;
    qr_code_token: string;
};

export default function CetakQRPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [jamaahList, setJamaahList] = useState<JamaahUser[]>([]);
    const [filteredList, setFilteredList] = useState<JamaahUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<JamaahUser | null>(null);

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredList(jamaahList);
        } else {
            setFilteredList(
                jamaahList.filter(j =>
                    j.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    j.no_wa.includes(searchQuery)
                )
            );
        }
    }, [searchQuery, jamaahList]);

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

        const { data: users } = await supabase
            .from('users')
            .select('user_id, nama, no_wa, gender, role, qr_code_token')
            .in('role', ['jamaah_dewasa', 'jamaah_anak'])
            .order('nama');

        setJamaahList(users || []);
        setFilteredList(users || []);
        setLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-lg mx-auto p-6">

                {/* Header (hidden on print) */}
                <div className="flex items-center gap-3 mb-6 print:hidden">
                    <Link href="/admin" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-purple-500" />
                            Cetak Kartu QR
                        </h1>
                        <p className="text-sm text-muted-foreground">Cari & cetak kartu jamaah</p>
                    </div>
                </div>

                {/* Search (hidden on print) */}
                {!selectedUser && (
                    <div className="space-y-4 print:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari nama jamaah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        {filteredList.length === 0 ? (
                            <p className="text-center text-muted-foreground py-10">Belum ada jamaah terdaftar.</p>
                        ) : (
                            <div className="space-y-2">
                                {filteredList.map((user) => (
                                    <button
                                        key={user.user_id}
                                        onClick={() => setSelectedUser(user)}
                                        className="w-full card-elegant flex items-center gap-3 text-left hover:border-primary/30 transition active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{user.nama}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.role === 'jamaah_anak' ? 'Anak' : 'Dewasa'} • {user.no_wa}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Print Card */}
                {selectedUser && (
                    <div className="space-y-4">
                        {/* Back button (hidden on print) */}
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="text-sm text-primary hover:underline print:hidden"
                        >
                            ← Pilih jamaah lain
                        </button>

                        {/* Printable Card */}
                        <div className="bg-white text-black rounded-2xl p-8 text-center shadow-xl border print:shadow-none print:border-2 print:border-black">
                            <h2 className="text-xs uppercase tracking-[0.3em] text-amber-700 font-serif mb-1">Kartu Jamaah</h2>
                            <h1 className="text-2xl font-bold text-amber-900 font-heading">As Sakinah</h1>
                            <div className="w-16 h-[1px] bg-amber-400 mx-auto my-4" />

                            <div className="flex justify-center my-6">
                                <div className="p-3 border-4 border-amber-200 rounded-xl">
                                    <QRCode
                                        value={selectedUser.qr_code_token || 'INVALID'}
                                        size={180}
                                        level="H"
                                    />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">{selectedUser.nama}</h3>
                            <p className="text-amber-700 text-sm uppercase tracking-widest mt-1">
                                {selectedUser.role.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-2">{selectedUser.no_wa}</p>

                            <div className="mt-6 pt-4 border-t border-amber-200">
                                <p className="text-[10px] text-amber-600 tracking-[0.4em] uppercase">
                                    Ramadhan 1447H
                                </p>
                            </div>
                        </div>

                        {/* Print Button (hidden on print) */}
                        <button
                            onClick={handlePrint}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold print:hidden"
                        >
                            <Printer className="w-5 h-5" />
                            Cetak Kartu
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
