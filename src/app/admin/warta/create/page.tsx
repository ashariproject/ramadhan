'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function CreateWartaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Unauthorized');

            const { error } = await supabase
                .from('warta_berita')
                .insert({
                    title: formData.title,
                    content: formData.content,
                    image_url: formData.image_url,
                    author_id: user.id
                });

            if (error) throw error;

            router.push('/warta'); // Go to feed to see result
            router.refresh();

        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
                        <ArrowLeft className="w-5 h-5 text-amber-500" />
                    </Link>
                    <h1 className="text-xl font-heading text-amber-400">Tulis Berita</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Judul</label>
                        <input
                            required
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 focus:border-amber-500 outline-none transition"
                            placeholder="Contoh: Jadwal Imsakiyah..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">URL Gambar (Opsional)</label>
                        <input
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 focus:border-amber-500 outline-none transition text-sm font-mono"
                            placeholder="https://..."
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Konten Berita</label>
                        <textarea
                            required
                            rows={8}
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 focus:border-amber-500 outline-none transition"
                            placeholder="Tuliskan isi berita di sini..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl hover:bg-amber-500 transition flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Send className="w-4 h-4" /> Terbitkan</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
