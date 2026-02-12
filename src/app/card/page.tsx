'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-qr-code';
import { Loader2, LogOut, Home } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function CardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/register');
                    return;
                }

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/register');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-islamic-pattern">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
        );
    }

    if (!profile) return null;

    const roleLabels: Record<string, string> = {
        jamaah_dewasa: 'Jamaah',
        jamaah_anak: 'Anak',
        panitia: 'Panitia',
        admin_media: 'Media',
        admin_utama: 'Admin'
    };

    return (
        <div className="min-h-screen bg-islamic-pattern flex flex-col items-center justify-center p-6">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <Link href="/" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                    <Home className="w-5 h-5" />
                </Link>
                <ThemeToggle />
            </div>

            {/* Card */}
            <div className="card-elegant w-full max-w-xs text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Kartu Jamaah</p>
                <h1 className="text-xl font-bold mb-4">As Sakinah</h1>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <QRCode
                        value={profile.qr_code_token || 'INVALID'}
                        size={140}
                        level="H"
                    />
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mb-4">
                    {profile.qr_code_token?.slice(0, 12)}...
                </p>

                {/* User Info */}
                <h2 className="text-lg font-bold">{profile.nama}</h2>
                <p className="text-sm text-primary font-medium">
                    {roleLabels[profile.role] || profile.role}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{profile.no_wa}</p>

                <div className="border-t border-border mt-4 pt-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        Ramadhan 1447H
                    </p>
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="mt-6 flex items-center gap-2 text-muted-foreground hover:text-destructive transition text-sm btn-ghost"
            >
                <LogOut className="w-4 h-4" />
                Keluar
            </button>
        </div>
    );
}
