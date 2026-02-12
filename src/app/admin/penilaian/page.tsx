'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, ClipboardEdit, Search, Star, CheckCircle, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type AnakUser = {
    user_id: string;
    nama: string;
    no_wa: string;
    gender: string;
};

const KATEGORI_OPTIONS = ['hafalan', 'adab', 'keaktifan', 'kebersihan'];

export default function PenilaianPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [anakList, setAnakList] = useState<AnakUser[]>([]);
    const [filteredList, setFilteredList] = useState<AnakUser[]>([]);
    const [selectedAnak, setSelectedAnak] = useState<AnakUser | null>(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [penilaian, setPenilaian] = useState({
        kategori: 'hafalan',
        nilai: 3,
        catatan: '',
    });

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredList(anakList);
        } else {
            setFilteredList(
                anakList.filter(a =>
                    a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.no_wa.includes(searchQuery)
                )
            );
        }
    }, [searchQuery, anakList]);

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

        // Fetch anak-anak
        const { data: anak } = await supabase
            .from('users')
            .select('user_id, nama, no_wa, gender')
            .eq('role', 'jamaah_anak')
            .order('nama');

        setAnakList(anak || []);
        setFilteredList(anak || []);
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!selectedAnak) return;
        setSaving(true);
        setSuccess(false);

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('penilaian_anak')
            .insert({
                user_id: selectedAnak.user_id,
                penilai_id: user?.id,
                kategori: penilaian.kategori,
                nilai: penilaian.nilai,
                catatan: penilaian.catatan,
            });

        if (error) {
            console.error('Error:', error);
        } else {
            setSuccess(true);
            setPenilaian({ kategori: 'hafalan', nilai: 3, catatan: '' });
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-lg mx-auto p-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <ClipboardEdit className="w-5 h-5 text-blue-500" />
                            Penilaian Anak
                        </h1>
                        <p className="text-sm text-muted-foreground">Beri catatan & nilai</p>
                    </div>
                </div>

                {/* Step 1: Select Anak */}
                {!selectedAnak ? (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari nama anak..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        {/* List */}
                        {filteredList.length === 0 ? (
                            <p className="text-center text-muted-foreground py-10">Belum ada anak-anak terdaftar.</p>
                        ) : (
                            <div className="space-y-2">
                                {filteredList.map((anak) => (
                                    <button
                                        key={anak.user_id}
                                        onClick={() => setSelectedAnak(anak)}
                                        className="w-full card-elegant flex items-center gap-3 text-left hover:border-primary/30 transition active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{anak.nama}</p>
                                            <p className="text-xs text-muted-foreground">{anak.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Step 2: Penilaian Form */
                    <div className="space-y-4">
                        {/* Selected Anak Info */}
                        <div className="card-elegant flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold">{selectedAnak.nama}</p>
                                    <p className="text-xs text-muted-foreground">{selectedAnak.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedAnak(null); setSuccess(false); }}
                                className="text-xs text-primary hover:underline"
                            >
                                Ganti
                            </button>
                        </div>

                        {success && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <p className="text-green-600 dark:text-green-400 font-medium text-sm">Penilaian berhasil disimpan!</p>
                            </div>
                        )}

                        {/* Kategori */}
                        <div className="card-elegant space-y-3">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kategori</label>
                            <div className="grid grid-cols-2 gap-2">
                                {KATEGORI_OPTIONS.map((kat) => (
                                    <button
                                        key={kat}
                                        type="button"
                                        onClick={() => setPenilaian({ ...penilaian, kategori: kat })}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-sm font-medium capitalize transition",
                                            penilaian.kategori === kat
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary hover:bg-muted"
                                        )}
                                    >
                                        {kat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nilai */}
                        <div className="card-elegant space-y-3">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nilai</label>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setPenilaian({ ...penilaian, nilai: n })}
                                        className="transition active:scale-90"
                                    >
                                        <Star
                                            className={cn(
                                                "w-10 h-10 transition",
                                                n <= penilaian.nilai
                                                    ? "text-amber-400 fill-amber-400"
                                                    : "text-muted-foreground/30"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Catatan */}
                        <div className="card-elegant space-y-3">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Catatan (opsional)</label>
                            <textarea
                                value={penilaian.catatan}
                                onChange={(e) => setPenilaian({ ...penilaian, catatan: e.target.value })}
                                placeholder="Tulis catatan..."
                                rows={3}
                                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className={cn(
                                "w-full btn-primary flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold",
                                saving && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                            {saving ? 'Menyimpan...' : 'Simpan Penilaian'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
