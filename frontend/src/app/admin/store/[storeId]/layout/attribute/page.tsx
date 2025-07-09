'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type {
    AttributeGroup,
    CreateAttributeGroupParams,
    CreateAttributeParams
} from '@/types/attribute';
import {
    fetchAttributeGroups,
    createAttributeGroup,
    deleteAttributeGroup,
    addAttribute,
    deleteAttribute
} from '@/lib/seat-attribute-api';

export default function SeatAttributesPage() {
    const params = useParams();
    const storeId = Number(params.storeId);

    const [groups, setGroups] = useState<AttributeGroup[]>([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newSelectionType, setNewSelectionType] = useState<'single' | 'multiple'>('single');
    const [newAttributes, setNewAttributes] = useState<string[]>(['']);
    const [showAttrModal, setShowAttrModal] = useState<{ open: boolean; groupId: number | null }>({ open: false, groupId: null });
    const [newAttrName, setNewAttrName] = useState('');

    // グループ一覧取得
    const loadGroups = async () => {
        const { data } = await fetchAttributeGroups(storeId);
        setGroups(data);
    };

    useEffect(() => {
        loadGroups().catch(() => { });
    }, [storeId]);

    // グループ作成
    const handleCreateGroup = async () => {
        const params: CreateAttributeGroupParams = {
            name: newGroupName,
            selectionType: newSelectionType,
            attributes: newAttributes
                .map(name => name.trim())
                .filter(name => name)
                .map(name => ({ name })),
        };
        await createAttributeGroup(storeId, params);
        setShowGroupModal(false);
        setNewGroupName('');
        setNewSelectionType('single');
        setNewAttributes(['']);
        loadGroups();
    };

    // グループ削除
    const handleRemoveGroup = async (groupId: number) => {
        await deleteAttributeGroup(storeId, groupId);
        loadGroups();
    };

    // 属性追加
    const handleAddAttribute = async () => {
        if (showAttrModal.groupId === null) return;
        const params: CreateAttributeParams = { name: newAttrName };
        await addAttribute(storeId, showAttrModal.groupId, params);
        setShowAttrModal({ open: false, groupId: null });
        setNewAttrName('');
        loadGroups();
    };

    // 属性削除
    const handleRemoveAttribute = async (groupId: number, attributeId: number) => {
        await deleteAttribute(storeId, groupId, attributeId);
        loadGroups();
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">座席属性設定</h1>

            <button
                className="mb-4 px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => setShowGroupModal(true)}
            >
                新しいグループ作成
            </button>

            {groups.length === 0 ? (
                <p>座席属性がありません</p>
            ) : (
                groups.map(g => (
                    <div key={g.id} className="mb-6 border p-4 rounded">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-semibold">{g.name}</span>
                                <span className="ml-2 text-sm text-gray-500">({g.selectionType})</span>
                            </div>
                            <div>
                                <button
                                    className="mr-2 text-sm text-green-500"
                                    onClick={() => setShowAttrModal({ open: true, groupId: g.id })}
                                >
                                    属性追加
                                </button>
                                <button
                                    className="text-sm text-red-500"
                                    onClick={() => handleRemoveGroup(g.id)}
                                >
                                    グループ削除
                                </button>
                            </div>
                        </div>
                        <ul className="list-disc list-inside mt-2">
                            {g.attributes.map(a => (
                                <li key={a.id} className="flex justify-between">
                                    <span>{a.name}</span>
                                    <button
                                        className="text-sm text-red-500"
                                        onClick={() => handleRemoveAttribute(g.id, a.id)}
                                    >
                                        削除
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}

            {/* グループ作成モーダル */}
            {showGroupModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded w-80">
                        <h2 className="text-lg font-semibold mb-2">グループ作成</h2>
                        <input
                            type="text"
                            placeholder="グループ名"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                        />
                        <select
                            value={newSelectionType}
                            onChange={e => setNewSelectionType(e.target.value as 'single' | 'multiple')}
                            className="w-full p-2 border rounded mb-2"
                        >
                            <option value="single">単一選択</option>
                            <option value="multiple">複数選択</option>
                        </select>
                        <label className="font-medium mt-2">属性:</label>
                        {newAttributes.map((attr, idx) => (
                            <div key={idx} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    placeholder="属性名"
                                    value={attr}
                                    onChange={e => {
                                        const arr = [...newAttributes];
                                        arr[idx] = e.target.value;
                                        setNewAttributes(arr);
                                    }}
                                    className="w-full p-2 border rounded mr-2"
                                />
                                <button
                                    type="button"
                                    className="text-red-500"
                                    onClick={() => {
                                        const arr = [...newAttributes];
                                        arr.splice(idx, 1);
                                        setNewAttributes(arr.length ? arr : ['']);
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="mb-4 text-sm text-blue-500"
                            onClick={() => setNewAttributes([...newAttributes, ''])}
                        >
                            属性を追加
                        </button>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-3 py-1 bg-gray-300 rounded"
                                onClick={() => setShowGroupModal(false)}
                            >
                                キャンセル
                            </button>
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded"
                                onClick={handleCreateGroup}
                            >
                                作成
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 属性追加モーダル */}
            {showAttrModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded w-80">
                        <h2 className="text-lg font-semibold mb-2">属性追加</h2>
                        <input
                            type="text"
                            placeholder="属性名"
                            value={newAttrName}
                            onChange={e => setNewAttrName(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-3 py-1 bg-gray-300 rounded"
                                onClick={() => setShowAttrModal({ open: false, groupId: null })}
                            >
                                キャンセル
                            </button>
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded"
                                onClick={handleAddAttribute}
                            >
                                追加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}