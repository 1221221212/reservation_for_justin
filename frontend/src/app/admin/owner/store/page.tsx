'use client';

import { useState, useEffect } from 'react';
import { fetchStores, createStore } from '@/lib/store-api';
import Link from 'next/link';
import type { Store } from '@/types/store';

export default function StoreListPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');

    // 店舗一覧取得
    const loadStores = async () => {
        const { data } = await fetchStores();
        setStores(data);
    };

    useEffect(() => {
        loadStores().catch(() => { });
    }, []);

    // 店舗追加
    const handleCreate = async () => {
        await createStore(newName);
        setShowModal(false);
        setNewName('');
        loadStores();
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">店舗管理</h1>

            {/* 店舗一覧 */}
            <ul>
                {stores.map((store) => (
                    <li key={store.id} className="flex items-center justify-between mb-2">
                        <span>{store.name}</span>
                        <Link href={`/admin/store/${store.id}`}>
                            <button className="px-2 py-1 bg-green-500 text-white rounded">
                                店舗管理画面へ
                            </button>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* 新規店舗追加ボタン */}
            <button
                className="mt-4 px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => setShowModal(true)}
            >
                店舗追加
            </button>

            {/* モーダル */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded relative w-80">
                        <button
                            className="absolute top-2 right-2 text-gray-500"
                            onClick={() => setShowModal(false)}
                        >
                            ×
                        </button>
                        <h2 className="text-lg font-semibold mb-2">新規店舗作成</h2>
                        <input
                            type="text"
                            placeholder="店舗名"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-3 py-1 bg-gray-300 rounded"
                                onClick={() => setShowModal(false)}
                            >
                                キャンセル
                            </button>
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded"
                                onClick={handleCreate}
                            >
                                作成
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
