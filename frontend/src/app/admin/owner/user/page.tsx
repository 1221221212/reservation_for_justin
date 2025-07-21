'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import type { Store } from '@/types/store';
import type { User, CreateUserParams } from '@/types/user';
import { fetchUsers, createUser } from '@/lib/user-api';
import { fetchStores } from '@/lib/store-api';

export default function UserListPage() {
    const { logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<Omit<CreateUserParams, 'storeId'> & { storeId: string }>({
        userId: '',
        username: '',
        password: '',
        role: 'STAFF',
        storeId: '',
    });
    const [selectedStore, setSelectedStore] = useState<string>('');

    // 初期表示でユーザー一覧取得
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            logout();
            return;
        }
        fetchUsers()
            .then(res => setUsers(res.data))
            .catch(() => { });
    }, [logout]);

    // モーダルを開くとき店舗一覧取得
    const openModal = () => {
        setShowModal(true);
        if (form.role !== 'OWNER') {
            fetchStores()
                .then(res => setStores(res.data))
                .catch(() => { });
        }
    };

    // 新規ユーザー作成
    const handleCreate = async () => {
        await createUser({
            userId: form.userId,
            username: form.username,
            password: form.password,
            role: form.role,
            storeId: form.role === 'OWNER' ? undefined : Number(selectedStore),
        });
        setShowModal(false);
        setForm({ userId: '', username: '', password: '', role: 'STAFF', storeId: '' });
        setSelectedStore('');
        fetchUsers()
            .then(res => setUsers(res.data))
            .catch(() => { });
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">ユーザー管理</h1>
            <button onClick={openModal} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">
                ユーザー追加
            </button>

            {/* ユーザー一覧 */}
            <table className="min-w-full border">
                <thead>
                    <tr>
                        <th className="border px-2 py-1">#</th>
                        <th className="border px-2 py-1">ユーザーID</th>
                        <th className="border px-2 py-1">表示名</th>
                        <th className="border px-2 py-1">ロール</th>
                        <th className="border px-2 py-1">ステータス</th>
                        <th className="border px-2 py-1">店舗</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td className="border px-2 py-1">{u.id}</td>
                            <td className="border px-2 py-1">{u.userId}</td>
                            <td className="border px-2 py-1">{u.username}</td>
                            <td className="border px-2 py-1">{u.role}</td>
                            <td className="border px-2 py-1">{u.status}</td>
                            <td className="border px-2 py-1">{u.store?.name ?? '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 新規ユーザーモーダル */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow w-[320px] relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500"
                            onClick={() => setShowModal(false)}
                        >
                            ×
                        </button>
                        <h2 className="text-lg font-semibold mb-4">新規ユーザー作成</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm">ユーザーID</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    value={form.userId}
                                    onChange={e => setForm({ ...form, userId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm">表示名</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm">パスワード</label>
                                <input
                                    type="password"
                                    className="w-full p-2 border rounded"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm">ロール</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={form.role}
                                    onChange={e => {
                                        setForm({ ...form, role: e.target.value as CreateUserParams['role'] });
                                        if (e.target.value === 'OWNER') {
                                            setSelectedStore('');
                                        } else {
                                            fetchStores()
                                                .then(res => setStores(res.data))
                                                .catch(() => { });
                                        }
                                    }}
                                >
                                    <option value="OWNER">owner</option>
                                    <option value="MANAGER">manager</option>
                                    <option value="STAFF">staff</option>
                                </select>
                            </div>
                            {form.role !== 'OWNER' && (
                                <div>
                                    <label className="block text-sm">店舗選択</label>
                                    {stores.map(s => (
                                        <label key={s.id} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="store"
                                                value={s.id}
                                                checked={String(s.id) === selectedStore}
                                                onChange={() => setSelectedStore(String(s.id))}
                                            />
                                            <span>{s.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            className="mt-6 w-full bg-blue-600 text-white p-2 rounded"
                            onClick={handleCreate}
                        >
                            作成
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
