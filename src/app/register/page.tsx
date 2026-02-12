'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, LogIn, Phone } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        no_wa: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const email = `${formData.no_wa}@assakinah.com`;
            const password = formData.password;

            if (!password) {
                setError('Masukkan password');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message === 'Invalid login credentials') {
                    throw new Error('No WA atau password salah. Cek kembali.');
                }
                throw error;
            }

            const user = data.user;

            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('user_id', user.id)
                .single();

            const role = profile?.role || 'jamaah_dewasa';

            if (role === 'jamaah_anak') {
                router.push('/journal');
            } else if (['admin_utama', 'panitia', 'admin_media'].includes(role)) {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }

        } catch (err: any) {
            console.error('LOGIN ERROR:', err);
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-islamic-pattern flex items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="card-elegant w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Masuk</h1>
                    <p className="text-sm text-muted-foreground">
                        Ramadhan 1447H — As Sakinah
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">No WhatsApp</label>
                        <input
                            name="no_wa"
                            required
                            placeholder="Masukkan No WA"
                            className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="Masukkan password"
                            className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                <LogIn className="w-4 h-4" />
                                Masuk
                            </>
                        )}
                    </button>
                </form>

                {/* Info daftar */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                    <Phone className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-500">Belum punya akun?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Hubungi <strong>Panitia</strong> untuk pendaftaran
                    </p>
                </div>
            </div>
        </div>
    );
}
