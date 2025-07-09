// frontend/app/admin/store/[storeId]/layout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchLayouts, createLayout } from '@/lib/layout-api';
import { fetchSeats } from '@/lib/seat-api';
import type { LayoutWithSeats, CreateLayoutParams } from '@/types/layout';
import type { SeatWithAttributes } from '@/types/seat';

export default function Page() {
    const { storeId } = useParams();
    const id = storeId ? Number(storeId) : null;

    const [layouts, setLayouts] = useState<LayoutWithSeats[]>([]);
    const [seats, setSeats] = useState<SeatWithAttributes[]>([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [newLayout, setNewLayout] = useState<CreateLayoutParams>({ name: '', seatIds: [] });

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([fetchLayouts(id), fetchSeats(id)])
            .then(([layoutRes, seatRes]) => {
                setLayouts(layoutRes.data);
                setSeats(seatRes.data);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const toggleSeatSelection = (seatId: number) => {
        setNewLayout(prev => {
            const exists = prev.seatIds.includes(seatId);
            return {
                ...prev,
                seatIds: exists
                    ? prev.seatIds.filter(id => id !== seatId)
                    : [...prev.seatIds, seatId],
            };
        });
    };

    const handleCreate = async () => {
        if (!id) return;
        try {
            const res = await createLayout(id, newLayout);
            setLayouts(prev => [...prev, res.data]);
            setShowModal(false);
            setNewLayout({ name: '', seatIds: [] });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">レイアウト設定</h1>
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() => setShowModal(true)}
                >
                    新規レイアウト作成
                </button>
            </div>

            {loading ? (
                <p>読み込み中...</p>
            ) : layouts.length === 0 ? (
                <p>レイアウトが登録されていません。</p>
            ) : (
                <div className="space-y-2">
                    {layouts.map(layout => (
                        <div key={layout.id} className="p-4 border rounded">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">{layout.name}</p>
                                    <p className="text-sm">ステータス: {layout.status}</p>
                                    <p className="text-sm">座席:</p>
                                    <ul className="list-disc list-inside text-sm">
                                        {layout.seats.map(s => (
                                            <li key={s.id}>{s.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded w-96 max-h-[90vh] overflow-auto">
                        <h2 className="text-lg font-semibold mb-4">新規レイアウト作成</h2>
                        <div className="mb-4">
                            <label htmlFor="layout-name" className="block mb-1 font-medium">レイアウト名</label>
                            <input
                                id="layout-name"
                                type="text"
                                value={newLayout.name}
                                onChange={e => setNewLayout({ ...newLayout, name: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <p className="font-medium mb-2">座席選択 (1つ以上必須)</p>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                                {seats.map(seat => (
                                    <label key={seat.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newLayout.seatIds.includes(seat.id)}
                                            onChange={() => toggleSeatSelection(seat.id)}
                                        />
                                        <span className="ml-2">{seat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
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
