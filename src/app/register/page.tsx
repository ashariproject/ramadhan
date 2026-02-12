'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nama: '',
        no_wa: '',
        gender: 'L',
        role: 'jamaah_dewasa',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const email = `${formData.no_wa}@assakinah.com`;
            const password = formData.password || 'ramadhan123';

            let user = null;

            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                user = data.user;
            } else {
                const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
                if (authError) throw authError;
                if (!authData.user) throw new Error('Failed to create user');
                user = authData.user;

                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        user_id: user.id,
                        nama: formData.nama,
                        no_wa: formData.no_wa,
                        gender: formData.gender,
                        role: formData.role,
                    });

                if (profileError) throw profileError;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('user_id', user.id)
                .single();

            const role = profile?.role || formData.role;

            if (role === 'jamaah_anak') {
                router.push('/journal');
            } else if (['admin_utama', 'panitia', 'admin_media'].includes(role)) {
                router.push('/admin');
            } else {
                router.push('/dashboard'); // Dewasa → Dashboard Subuh
            }

        } catch (err: any) {
            console.error('AUTH ERROR:', err);
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
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-1">
                        {isLogin ? 'Masuk' : 'Daftar Baru'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isLogin ? 'Selamat datang kembali' : 'Bergabung dengan kami'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nama Lengkap</label>
                            <input
                                name="nama"
                                required={!isLogin}
                                placeholder="Masukkan nama"
                                className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition"
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WhatsApp</label>
                        <input
                            name="no_wa"
                            required
                            placeholder="08..."
                            className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition"
                            onChange={handleChange}
                        />
                    </div>

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gender</label>
                                <select
                                    name="gender"
                                    className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 outline-none"
                                    onChange={handleChange}
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Peran</label>
                                <select
                                    name="role"
                                    className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 outline-none"
                                    onChange={handleChange}
                                >
                                    <option value="jamaah_dewasa">Dewasa</option>
                                    <option value="jamaah_anak">Anak-Anak</option>
                                    <option value="panitia">Panitia (Untuk Testing)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="******"
                            className="w-full mt-1 bg-secondary border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition"
                            onChange={handleChange}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Default: ramadhan123</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Masuk' : 'Daftar')}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary hover:underline text-sm"
                        >
                            {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
