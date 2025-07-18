// frontend/src/app/store/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchStores } from '@/lib/store-api';
import type { Store } from '@/types/store';

export default function StoreListPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStores()
            .then((res) => {
                setStores(res.data);
            })
            .catch((e) => {
                setError(e.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <p>読み込み中…</p>;
    if (error) return <p className="text-red-600">エラー: {error}</p>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">ご利用店舗一覧</h1>
            <ul className="space-y-2">
                {stores.map((store) => (
                    <li key={store.id}>
                        <Link
                            href={`/store/${store.id}/reserve`}
                            className="text-blue-600 hover:underline"
                        >
                            {store.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
