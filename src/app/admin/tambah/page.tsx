'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TambahJamaahPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nama: '',
        no_wa: '',
        gender: 'L',
        role: 'jamaah_dewasa',
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
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
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const email = `${formData.no_wa}@assakinah.com`;
            const password = 'ramadhan123'; // Default password for jamaah

            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Gagal membuat user');

            // 2. Insert profile
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    user_id: authData.user.id,
                    nama: formData.nama,
                    no_wa: formData.no_wa,
                    gender: formData.gender,
                    role: formData.role,
                });

            if (profileError) throw profileError;

            setSuccess(true);
            setFormData({ nama: '', no_wa: '', gender: 'L', role: 'jamaah_dewasa' });

            // Re-login as panitia (signUp changes the session)
            // We need to sign back in as the panitia
            // For now, we show success and let panitia continue

        } catch (err: any) {
            console.error('Error:', err);
            if (err.message?.includes('already registered')) {
                setError('Nomor WA ini sudah terdaftar.');
            } else {
                setError(err.message || 'Terjadi kesalahan.');
            }
        } finally {
            setSaving(false);
        }
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
                            <UserPlus className="w-5 h-5 text-emerald-500" />
                            Tambah Jamaah
                        </h1>
                        <p className="text-sm text-muted-foreground">Daftarkan jamaah baru</p>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                            <p className="text-green-600 dark:text-green-400 font-medium text-sm">Jamaah berhasil didaftarkan!</p>
                            <p className="text-xs text-muted-foreground">Password default: ramadhan123</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="card-elegant space-y-4">
                        {/* Nama */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nama Lengkap</label>
                            <input
                                name="nama"
                                value={formData.nama}
                                required
                                placeholder="Contoh: Abdullah"
                                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                onChange={handleChange}
                            />
                        </div>

                        {/* No WA */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No. WhatsApp</label>
                            <input
                                name="no_wa"
                                value={formData.no_wa}
                                required
                                placeholder="08..."
                                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Gender & Role */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3"
                                    onChange={handleChange}
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kategori</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3"
                                    onChange={handleChange}
                                >
                                    <option value="jamaah_dewasa">Dewasa</option>
                                    <option value="jamaah_anak">Anak-Anak</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className={cn(
                            "w-full btn-primary flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold",
                            saving && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        {saving ? 'Menyimpan...' : 'Daftarkan Jamaah'}
                    </button>
                </form>
            </div>
        </div>
    );
}
