// frontend/app/admin/store/[storeId]/layout/seat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchSeats, createSeat, suspendSeat } from '@/lib/seat-api';
import type { SeatWithAttributes, CreateSeatParams } from '@/types/seat';
import { fetchAttributeGroups } from '@/lib/seat-attribute-api';
import type { AttributeGroup } from '@/types/attribute';

export default function SeatPage() {
    const { storeId } = useParams();
    const id = storeId ? Number(storeId) : null;

    const [seats, setSeats] = useState<SeatWithAttributes[]>([]);
    const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number[]>>({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newSeat, setNewSeat] = useState<CreateSeatParams>({ name: '', minCapacity: 1, maxCapacity: 1 });

    // Fetch seats and attribute groups
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([fetchSeats(id), fetchAttributeGroups(id)])
            .then(([seatRes, groupRes]) => {
                setSeats(seatRes.data);
                setAttributeGroups(groupRes.data);
                // initialize selections for groups
                const init: Record<number, number[]> = {};
                groupRes.data.forEach(g => { init[g.id] = []; });
                setSelectedAttributes(init);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleCreate = async () => {
        if (!id) return;
        // flatten selectedAttributes
        const attributeIds = Object.values(selectedAttributes).flat();
        try {
            const res = await createSeat(id, { ...newSeat, attributeIds });
            setSeats([...seats, res.data]);
            setShowModal(false);
            setNewSeat({ name: '', minCapacity: 1, maxCapacity: 1 });
            // reset selections
            const reset: Record<number, number[]> = {};
            attributeGroups.forEach(g => { reset[g.id] = []; });
            setSelectedAttributes(reset);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSuspend = async (seatId: number) => {
        if (!id) return;
        try {
            await suspendSeat(id, seatId);
            setSeats(seats.map(s => s.id === seatId ? { ...s, status: 'suspended' } : s));
        } catch (e) {
            console.error(e);
        }
    };

    // handle selection change
    const onSelect = (group: AttributeGroup, attrId: number, checked: boolean) => {
        setSelectedAttributes(prev => {
            const current = prev[group.id] || [];
            let updated: number[] = [];
            if (group.selectionType === 'SINGLE') {
                updated = checked ? [attrId] : [];
            } else {
                if (checked) {
                    updated = [...current, attrId];
                } else {
                    updated = current.filter(id => id !== attrId);
                }
            }
            return { ...prev, [group.id]: updated };
        });
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">座席設定</h1>
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() => setShowModal(true)}
                >
                    新規作成
                </button>
            </div>

            {loading ? (
                <p>読み込み中...</p>
            ) : seats.length === 0 ? (
                <p>座席が登録されていません。</p>
            ) : (
                <div className="space-y-2">
                    {seats.map(seat => (
                        <div key={seat.id} className="flex justify-between p-4 border rounded">
                            <div>
                                <p className="font-medium">{seat.name}</p>
                                <p className="text-sm">{seat.minCapacity} - {seat.maxCapacity} 名</p>
                                <div className="flex mt-1 space-x-2 text-sm">
                                    {seat.attributes.map(attr => (
                                        <span
                                            key={attr.attributeId}
                                            className="px-2 py-0.5 bg-gray-200 rounded-full"
                                        >
                                            {attr.groupName}: {attr.attributeName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="capitalize">{seat.status}</span>
                                <button
                                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                                    onClick={() => handleSuspend(seat.id)}
                                    disabled={seat.status === 'suspended'}
                                >
                                    停止
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 新規作成モーダル */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded w-96 max-h-[90vh] overflow-auto">
                        <h2 className="text-lg font-semibold mb-4">座席新規作成</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block mb-1 font-medium">座席名</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={newSeat.name}
                                    onChange={e => setNewSeat({ ...newSeat, name: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label htmlFor="minCapacity" className="block mb-1 font-medium">最小人数</label>
                                <input
                                    id="minCapacity"
                                    type="number"
                                    value={newSeat.minCapacity}
                                    onChange={e => setNewSeat({ ...newSeat, minCapacity: Number(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label htmlFor="maxCapacity" className="block mb-1 font-medium">最大人数</label>
                                <input
                                    id="maxCapacity"
                                    type="number"
                                    value={newSeat.maxCapacity}
                                    onChange={e => setNewSeat({ ...newSeat, maxCapacity: Number(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {/* 属性選択セクション */}
                            {attributeGroups.map(group => (
                                <div key={group.id} className="mt-4">
                                    <p className="font-medium mb-2">{group.name}</p>
                                    <div className="space-y-1">
                                        {group.attributes.map(attr => {
                                            const checked = selectedAttributes[group.id]?.includes(attr.id);
                                            return (
                                                <label key={attr.id} className="flex items-center space-x-2">
                                                    <input
                                                        type={group.selectionType === 'SINGLE' ? 'radio' : 'checkbox'}
                                                        name={`group-${group.id}`}
                                                        checked={checked}
                                                        onChange={e => onSelect(group, attr.id, e.target.checked)}
                                                    />
                                                    <span>{attr.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

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