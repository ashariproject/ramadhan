'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { Loader2, X, CheckCircle, User, MapPin, Camera, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getCurrentSession, isWithinGeofence } from '@/lib/attendance';
import { SEASONS } from '@/lib/constants';
import { ThemeToggle } from '@/components/ThemeToggle';

type ScannedUser = {
    user_id: string;
    nama: string;
    role: string;
    no_wa: string;
    gender: string;
};

export default function ScanPage() {
    const [userData, setUserData] = useState<ScannedUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cameraError, setCameraError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [locationState, setLocationState] = useState<{ lat: number; lng: number } | null>(null);
    const [sessionInfo, setSessionInfo] = useState<{ type: string | null; valid: boolean }>({ type: null, valid: false });

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const audioSuccess = useRef<HTMLAudioElement | null>(null);
    const audioError = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }

        audioSuccess.current = new Audio('/sounds/success.mp3');
        audioError.current = new Audio('/sounds/error.mp3');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationState({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => console.error("Geo Error:", err)
            );
        }

        const session = getCurrentSession();
        setSessionInfo({ type: session, valid: !!session });

    }, []);

    const playSound = (type: 'success' | 'error') => {
        try {
            if (type === 'success') audioSuccess.current?.play().catch(() => { });
            else audioError.current?.play().catch(() => { });
        } catch (e) { }
    };

    const startScanning = async () => {
        setCameraError('');
        setIsScanning(true);

        try {
            if (!scannerRef.current) return;
            await scannerRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess,
                onScanFailure
            );
        } catch (err: any) {
            console.error("Camera start error:", err);
            setCameraError("Gagal akses kamera. Pastikan izin diberikan.");
            setIsScanning(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            await scannerRef.current.stop();
            setIsScanning(false);
        }
    };

    const onScanSuccess = async (decodedText: string) => {
        await stopScanning();
        setLoading(true);
        setError('');

        try {
            const currentSession = getCurrentSession();
            let currentLat = locationState?.lat || 0;
            let currentLng = locationState?.lng || 0;

            const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id, nama, role, no_wa, gender')
                .eq('qr_code_token', decodedText)
                .single();

            if (userError || !user) {
                throw new Error('QR Code tidak valid / User tidak ditemukan.');
            }

            const { error: logError } = await supabase
                .from('attendance_logs')
                .insert({
                    user_id: user.user_id,
                    season_id: SEASONS.current,
                    session_type: currentSession || 'demo_session',
                    is_valid: true,
                    location_data: { lat: currentLat, lng: currentLng }
                });

            if (logError) {
                console.error("Log Error:", logError);
            }

            setUserData(user);
            playSound('success');

        } catch (err: any) {
            setError(err.message);
            playSound('error');
        } finally {
            setLoading(false);
        }
    };

    const onScanFailure = (errorMessage: string) => { };

    const handleReset = () => {
        setUserData(null);
        setError('');
        startScanning();
    };

    return (
        <div className="min-h-screen bg-islamic-pattern flex flex-col items-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold">Scanner Panitia</h1>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Status Bar */}
                <div className="flex gap-2 mb-4">
                    <div className={cn("flex-1 card-elegant py-2 px-3 flex items-center gap-2", sessionInfo.valid ? "text-accent" : "text-primary")}>
                        <Clock className="w-4 h-4" />
                        <div className="text-xs">
                            <span className="block font-bold">{sessionInfo.type?.toUpperCase() || 'TEST'}</span>
                            <span className="text-muted-foreground text-[10px]">Sesi</span>
                        </div>
                    </div>
                    <div className={cn("flex-1 card-elegant py-2 px-3 flex items-center gap-2", locationState ? "text-accent" : "text-primary")}>
                        <MapPin className="w-4 h-4" />
                        <div className="text-xs">
                            <span className="block font-bold">Lokasi</span>
                            <span className="text-muted-foreground text-[10px]">{locationState ? 'OK' : '...'}</span>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="card-elegant overflow-hidden relative min-h-[350px] flex flex-col">

                    {/* Camera Error */}
                    {cameraError && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-destructive">
                            <X className="w-12 h-12 mb-4 opacity-50" />
                            <p>{cameraError}</p>
                            <button onClick={startScanning} className="mt-4 btn-ghost">Coba Lagi</button>
                        </div>
                    )}

                    {/* Idle / Start Button */}
                    {!isScanning && !userData && !loading && !error && !cameraError && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Camera className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-lg font-bold mb-1">Siap Scan</h2>
                            <p className="text-sm text-muted-foreground mb-6">Mode Testing: Geofence dinonaktifkan.</p>
                            <button onClick={startScanning} className="btn-primary w-full">
                                Mulai Kamera
                            </button>
                        </div>
                    )}

                    {/* Scanner */}
                    <div
                        id="reader"
                        className={cn(
                            "w-full bg-secondary flex-1 rounded-lg overflow-hidden",
                            (!isScanning || userData || error) && "hidden"
                        )}
                    />

                    {/* Loading */}
                    {loading && (
                        <div className="absolute inset-0 bg-card/80 flex items-center justify-center z-20">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    )}

                    {/* Result */}
                    {(userData || error) && (
                        <div className="absolute inset-0 bg-card z-10 flex flex-col items-center justify-center p-6 text-center">

                            {error ? (
                                <div className="space-y-4">
                                    <div className="w-14 h-14 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                                        <X className="w-7 h-7 text-destructive" />
                                    </div>
                                    <h2 className="text-lg font-bold text-destructive">Gagal</h2>
                                    <p className="text-sm text-muted-foreground">{error}</p>
                                    <button onClick={handleReset} className="btn-ghost">Scan Lagi</button>
                                </div>
                            ) : (
                                <div className="space-y-5 w-full">
                                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto border border-accent">
                                        <CheckCircle className="w-8 h-8 text-accent" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold mb-1">{userData?.nama}</h2>
                                        <p className="text-primary text-sm font-medium uppercase tracking-widest">
                                            {userData?.role.replace('_', ' ')}
                                        </p>
                                    </div>

                                    <div className="bg-secondary rounded-lg p-3 text-left space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span>{userData?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span className="capitalize">{sessionInfo.type || 'Test Mode'}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-accent italic">
                                        "Semoga Allah menerima amal ibadahnya"
                                    </p>

                                    <button onClick={handleReset} className="btn-primary w-full">
                                        Selesai & Scan Lagi
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-xs text-muted-foreground mt-6 text-center">
                    Data absensi akan otomatis tercatat.
                </p>
            </div>
        </div>
    );
}
