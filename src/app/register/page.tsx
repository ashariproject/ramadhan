'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, LogIn, Phone, Moon, Sun as SunIcon } from 'lucide-react';
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
        <div className="min-h-screen bg-islamic-pattern">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden">
                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-[url('/logo-ramadhan.png')] bg-center bg-no-repeat bg-contain opacity-10"></div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-white px-4 text-center">
                    <div className="mb-4">
                        <Moon className="w-16 h-16 mx-auto mb-2 opacity-90" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Masjid As Sakinah
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 mb-1">
                        Ramadhan 1447H
                    </p>
                    <p className="text-sm opacity-75">
                        Program Kajian Subuh & Kegiatan Ramadhan
                    </p>
                </div>

                {/* Wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-12 fill-background">
                        <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                    </svg>
                </div>
            </div>

            {/* Login Form */}
            <div className="max-w-md mx-auto px-4 -mt-8 pb-12">
                <div className="card-elegant shadow-xl">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <LogIn className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Masuk ke Akun</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Silakan login untuk melanjutkan
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                No WhatsApp
                            </label>
                            <input
                                name="no_wa"
                                required
                                placeholder="08..."
                                className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition"
                                onChange={handleChange}
                                value={formData.no_wa}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Masukkan password"
                                className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition"
                                onChange={handleChange}
                                value={formData.password}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
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
        </div>
    );
}
