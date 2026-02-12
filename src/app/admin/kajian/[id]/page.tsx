'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditKajianPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        tanggal: '',
        hari: '',
        hijriah: '',
        pemateri: '',
        tema: '',
        is_active: true,
        foto_pemateri: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchKajian();
    }, [id]);

    const fetchKajian = async () => {
        try {
            const { data, error } = await supabase
                .from('kajian_subuh')
                .select('*')
                .eq('kajian_id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    tanggal: data.tanggal,
                    hari: data.hari,
                    hijriah: data.hijriah || '',
                    pemateri: data.pemateri,
                    tema: data.tema,
                    is_active: data.is_active,
                    foto_pemateri: data.foto_pemateri || ''
                });
            }
        } catch (error) {
            console.error('Error fetching kajian:', error);
            router.push('/admin/kajian');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        const date = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
        const dayName = new Intl.DateTimeFormat('id-ID', options).format(date);

        setFormData({
            ...formData,
            tanggal: dateStr,
            hari: dayName
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('Pilih gambar terlebih dahulu.');
            }

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('kajian-avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('kajian-avatars')
                .getPublicUrl(filePath);

            setFormData({ ...formData, foto_pemateri: publicUrl });

        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('kajian_subuh')
                .update({
                    tanggal: formData.tanggal,
                    hari: formData.hari,
                    hijriah: formData.hijriah,
                    pemateri: formData.pemateri,
                    tema: formData.tema,
                    is_active: formData.is_active
                })
                .eq('kajian_id', id);

            if (error) throw error;

            router.push('/admin/kajian');
            router.refresh();

        } catch (error: any) {
            alert('Error: ' + error.message);
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
            <div className="max-w-2xl mx-auto p-6 pb-24">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/admin/kajian" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Edit Jadwal Kajian</h1>
                        <p className="text-sm text-muted-foreground">Perbarui informasi kajian</p>
                    </div>
                </div>

                <div className="card-elegant">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    className="input-field w-full"
                                    value={formData.tanggal}
                                    onChange={handleDateChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hari</label>
                                <input
                                    required
                                    className="input-field w-full bg-muted/50"
                                    value={formData.hari}
                                    placeholder="Otomatis"
                                    onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tanggal Hijriah (Opsional)</label>
                            <input
                                className="input-field w-full"
                                placeholder="Contoh: 1 Ramadhan 1447H"
                                value={formData.hijriah}
                                onChange={(e) => setFormData({ ...formData, hijriah: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Pemateri</label>
                            <input
                                required
                                className="input-field w-full"
                                placeholder="Nama Ustadz/Pemateri"
                                value={formData.pemateri}
                                onChange={(e) => setFormData({ ...formData, pemateri: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Foto Pemateri (Opsional)</label>
                            <div className="flex items-center gap-4">
                                {formData.foto_pemateri && (
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                        <img src={formData.foto_pemateri} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploading}
                                    onChange={handleImageUpload}
                                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                                {uploading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tema Kajian</label>
                            <textarea
                                required
                                rows={3}
                                className="input-field w-full"
                                placeholder="Judul atau tema kajian..."
                                value={formData.tema}
                                onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium">Tampilkan Jadwal Ini</label>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
