'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Trash2, Edit2, Search, Check, X } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

type UserProfile = {
    user_id: string;
    nama: string;
    no_wa: string;
    role: string;
    gender: string;
};

export default function UserManagementPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string, nama: string) => {
        if (!confirm(`Yakin ingin menghapus "${nama}"?`)) return;

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
            setUsers(users.filter(u => u.user_id !== userId));
        } catch (error: any) {
            console.error('Delete error:', error);
            alert('Gagal menghapus: ' + error.message);
        }
    };

    const startEdit = (user: UserProfile) => {
        setEditingId(user.user_id);
        setNewRole(user.role);
    };

    const saveEdit = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('user_id', userId);

            if (error) throw error;
            setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
            setEditingId(null);
        } catch (error: any) {
            console.error('Update error:', error);
            alert('Gagal update: ' + error.message);
        }
    };

    const filteredUsers = users.filter(u =>
        u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.no_wa.includes(searchTerm)
    );

    const roleLabels: Record<string, string> = {
        jamaah_dewasa: 'Jamaah',
        jamaah_anak: 'Anak',
        panitia: 'Panitia',
        admin_media: 'Media',
        admin_utama: 'Admin'
    };

    return (
        <div className="min-h-screen bg-islamic-pattern">
            <div className="max-w-2xl mx-auto p-6 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 rounded-full bg-secondary hover:bg-muted transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Kelola Jamaah</h1>
                            <p className="text-sm text-muted-foreground">{users.length} Terdaftar</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        placeholder="Cari nama atau WA..."
                        className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 focus:border-primary outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-primary w-6 h-6" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredUsers.map(user => (
                            <div key={user.user_id} className="card-elegant flex items-center justify-between py-3 px-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{user.nama}</h3>
                                    <p className="text-xs text-muted-foreground font-mono">{user.no_wa}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${user.gender === 'L' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-pink-500/10 text-pink-600 dark:text-pink-400'}`}>
                                            {user.gender === 'L' ? 'L' : 'P'}
                                        </span>
                                        {editingId === user.user_id ? (
                                            <select
                                                className="bg-secondary border border-border text-xs rounded px-2 py-0.5 outline-none"
                                                value={newRole}
                                                onChange={(e) => setNewRole(e.target.value)}
                                            >
                                                <option value="jamaah_dewasa">Jamaah</option>
                                                <option value="jamaah_anak">Anak</option>
                                                <option value="panitia">Panitia</option>
                                                <option value="admin_media">Media</option>
                                                <option value="admin_utama">Admin</option>
                                            </select>
                                        ) : (
                                            <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                {roleLabels[user.role] || user.role}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 ml-2">
                                    {editingId === user.user_id ? (
                                        <>
                                            <button onClick={() => saveEdit(user.user_id)} className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(user)} className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-secondary transition">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(user.user_id, user.nama)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">Tidak ada user ditemukan.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
