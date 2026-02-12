'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, PlusCircle, Pencil, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function KajianListPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [kajianList, setKajianList] = useState<any[]>([]);

    useEffect(() => {
        fetchKajian();
    }, []);

    const fetchKajian = async () => {
        try {
            const { data, error } = await supabase
                .from('kajian_subuh')
                .select('*')
                .order('tanggal', { ascending: true });

            if (error) throw error;
            setKajianList(data || []);
        } catch (error) {
            console.error('Error fetching kajian:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

        try {
            const { error } = await supabase
                .from('kajian_subuh')
                .delete()
                .eq('kajian_id', id);

            if (error) throw error;
            fetchKajian(); // Refresh list
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-islamic-pattern flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-4xl mx-auto p-6 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Kelola Kajian Subuh</h1>
                            <p className="text-sm text-muted-foreground">Daftar Jadwal Kajian</p>
                        </div>
                    </div>
                    <Link href="/admin/kajian/create" className="btn-primary flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Tambah Jadwal</span>
                    </Link>
                </div>

                {/* List */}
                <div className="card-elegant overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b border-white/10 text-left">
                                <tr>
                                    <th className="p-4 font-bold text-muted-foreground">TANGGAL</th>
                                    <th className="p-4 font-bold text-muted-foreground">PEMATERI</th>
                                    <th className="p-4 font-bold text-muted-foreground">TEMA</th>
                                    <th className="p-4 font-bold text-muted-foreground text-right">AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kajianList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                            Belum ada data kajian.
                                        </td>
                                    </tr>
                                ) : (
                                    kajianList.map((kajian) => (
                                        <tr key={kajian.kajian_id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{new Date(kajian.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                    <span className="text-xs text-muted-foreground">{kajian.hari}</span>
                                                    <span className="text-xs text-amber-500 font-mono">{kajian.hijriah}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top font-medium">
                                                <div className="flex items-center gap-3">
                                                    {kajian.foto_pemateri ? (
                                                        <img src={kajian.foto_pemateri} alt={kajian.pemateri} className="w-8 h-8 rounded-full object-cover bg-secondary" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                            {kajian.pemateri.charAt(0)}
                                                        </div>
                                                    )}
                                                    {kajian.pemateri}
                                                </div>
                                            </td>
                                            <td className="p-4 align-top text-muted-foreground">
                                                {kajian.tema}
                                            </td>
                                            <td className="p-4 align-top text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/kajian/${kajian.kajian_id}`} className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(kajian.kajian_id)}
                                                        className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
