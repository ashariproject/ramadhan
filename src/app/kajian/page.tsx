'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';

type Kajian = {
    kajian_id: string;
    tanggal: string;
    hari: string;
    hijriah: string;
    pemateri: string;
    tema: string;
};

export default function KajianPage() {
    const [loading, setLoading] = useState(true);
    const [kajianList, setKajianList] = useState<Kajian[]>([]);

    useEffect(() => {
        fetchKajian();
    }, []);

    const fetchKajian = async () => {
        try {
            const { data } = await supabase
                .from('kajian_subuh')
                .select('*')
                .eq('is_active', true)
                .order('tanggal', { ascending: true });

            if (data) {
                setKajianList(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatTanggal = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-lg mx-auto p-4 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold">Jadwal Kajian Subuh</h1>
                            <p className="text-xs text-muted-foreground">Ramadhan 1447H</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Kajian List */}
                {kajianList.length === 0 ? (
                    <div className="card-elegant py-12 text-center">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">Belum ada jadwal kajian</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {kajianList.map((item, idx) => {
                            const isToday = new Date(item.tanggal).toDateString() === new Date().toDateString();
                            const isPast = new Date(item.tanggal) < new Date(new Date().toDateString());

                            return (
                                <div
                                    key={item.kajian_id}
                                    className={`card-elegant py-3 px-4 ${isToday ? 'border-primary/50 bg-primary/5' : ''} ${isPast ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Date Badge */}
                                        <div className="text-center shrink-0 w-14">
                                            <div className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-blue-500'}`}>
                                                {item.hijriah?.split(' ')[0]}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">{item.hari}</div>
                                            <div className="text-[9px] text-muted-foreground">{formatTanggal(item.tanggal)}</div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{item.tema}</p>
                                            <p className="text-xs text-muted-foreground">{item.pemateri}</p>
                                            {isToday && (
                                                <span className="inline-block mt-1 text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                                    Hari Ini
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
