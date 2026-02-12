'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

type NewsItem = {
    news_id: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
    author: { nama: string } | null;
};

export default function WartaPage() {
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const { data, error } = await supabase
                .from('warta_berita')
                .select(`
                    *,
                    author:users!author_id(nama)
                `)
                .order('created_at', { ascending: false });

            if (data) {
                // @ts-ignore
                setNews(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-islamic-pattern">
            {/* Header */}
            <div className="bg-card/80 backdrop-blur-md sticky top-0 z-20 border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Warta As Sakinah</h1>
                        <p className="text-xs text-muted-foreground">Informasi & Kegiatan Terbaru</p>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            <div className="p-4 space-y-4 max-w-2xl mx-auto pb-20">
                {loading && (
                    <div className="flex justify-center pt-10">
                        <Loader2 className="animate-spin text-primary w-6 h-6" />
                    </div>
                )}

                {!loading && news.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        Belum ada berita terbaru.
                    </div>
                )}

                {news.map((item) => (
                    <article key={item.news_id} className="card-elegant overflow-hidden">
                        {item.image_url && (
                            <div className="aspect-video w-full bg-secondary -mx-6 -mt-6 mb-4 overflow-hidden">
                                <img src={item.image_url} alt={item.title} className="object-cover w-full h-full" />
                            </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long' })}</span>
                            </div>
                            {item.author && (
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{item.author.nama}</span>
                                </div>
                            )}
                        </div>

                        <h2 className="text-lg font-bold mb-2">{item.title}</h2>

                        <p className="text-sm text-muted-foreground whitespace-pre-line">{item.content}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}
