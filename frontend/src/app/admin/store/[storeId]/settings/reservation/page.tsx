'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import {
    fetchReservationSettings,
    updateReservationSettings,
} from '@/lib/reservation-settings-api';
import type {
    ReservationSettings,
    BookingWindow,
    CancellationPolicy,
    RollingOpen,
    BulkOpen,
    RollingClose,
    AbsoluteClose,
} from '@/types/reservation-settings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function ReservationSettingsPage() {
    const { storeId } = useParams();
    const sid = storeId ? Number(storeId) : NaN;

    const [settings, setSettings] = useState<ReservationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaultBW: BookingWindow = {
        open: { mode: 'rolling', daysBefore: 0, releaseTime: '00:00' },
        close: { mode: 'rolling', hoursBeforeStart: 0, minutesBeforeStart: 0 },
    };
    const defaultCP: CancellationPolicy = {
        enabled: false,
        deadlineBefore: { days: 0, hours: 0, minutes: 0 },
    };

    useEffect(() => {
        if (isNaN(sid)) return;
        fetchReservationSettings(sid)
            .then((data) => {
                const mergedBW: BookingWindow = {
                    open: { ...defaultBW.open, ...(data.bookingWindow?.open || {}) },
                    close: { ...defaultBW.close, ...(data.bookingWindow?.close || {}) },
                };
                const mergedCancel: CancellationPolicy = {
                    ...defaultCP,
                    ...(data.cancellationPolicy || {}),
                };
                const mergedModify: CancellationPolicy = {
                    ...defaultCP,
                    ...(data.modificationPolicy || {}),
                };
                setSettings({
                    ...data,
                    bookingWindow: mergedBW,
                    cancellationPolicy: mergedCancel,
                    modificationPolicy: mergedModify,
                });
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [sid]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!settings || isNaN(sid)) return;
        setSaving(true);
        setError(null);
        try {
            const raw = await updateReservationSettings(sid, settings);
            const mergedBW: BookingWindow = {
                open: { ...defaultBW.open, ...(raw.bookingWindow?.open || {}) },
                close: { ...defaultBW.close, ...(raw.bookingWindow?.close || {}) },
            };
            const mergedCancel: CancellationPolicy = {
                ...defaultCP,
                ...(raw.cancellationPolicy || {}),
            };
            const mergedModify: CancellationPolicy = {
                ...defaultCP,
                ...(raw.modificationPolicy || {}),
            };
            setSettings({
                ...raw,
                bookingWindow: mergedBW,
                cancellationPolicy: mergedCancel,
                modificationPolicy: mergedModify,
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>読み込み中...</div>;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!settings) return <div>設定が見つかりません</div>;

    const unit = settings.gridUnit;
    const maxCount = Math.floor((24 * 60) / unit);
    const MULTIPLEs = Array.from({ length: maxCount }, (_, i) => (i + 1) * unit);
    const bw = settings.bookingWindow;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
            {/* 予約枠設定 */}
            <div>
                <Label htmlFor="gridUnit">予約枠の刻み</Label>
                <select
                    id="gridUnit"
                    value={settings.gridUnit}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        const newUnit = Number(e.target.value);
                        setSettings({
                            ...settings,
                            gridUnit: newUnit,
                            standardReservationMinutes: newUnit,
                            bufferTime: Math.min(settings.bufferTime, newUnit),
                        });
                    }}
                    className="w-full border rounded px-3 py-2 focus:ring"
                >
                    <option value={15}>15分</option>
                    <option value={30}>30分</option>
                    <option value={60}>1時間</option>
                </select>
            </div>
            <div>
                <Label htmlFor="standardReservationMinutes">標準予約時間</Label>
                <select
                    id="standardReservationMinutes"
                    value={settings.standardReservationMinutes}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setSettings({ ...settings, standardReservationMinutes: Number(e.target.value) })
                    }
                    className="w-full border rounded px-3 py-2 focus:ring"
                >
                    {MULTIPLEs.map((m) => (
                        <option key={m} value={m}>
                            {m % 60 === 0 ? `${m / 60}時間` : `${m}分`}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <Label htmlFor="bufferTime">バッファタイム</Label>
                <select
                    id="bufferTime"
                    value={settings.bufferTime}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setSettings({ ...settings, bufferTime: Number(e.target.value) })
                    }
                    className="w-full border rounded px-3 py-2 focus:ring"
                >
                    <option value={0}>0分</option>
                    {MULTIPLEs.map((m) => (
                        <option key={m} value={m}>
                            {m % 60 === 0 ? `${m / 60}時間` : `${m}分`}
                        </option>
                    ))}
                </select>
            </div>

            {/* 受付開始 */}
            <fieldset className="space-y-2">
                <legend className="font-semibold">予約受付開始</legend>
                <div className="flex space-x-4">
                    {/* ラジオボタンロールリング */}
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="openMode"
                            checked={bw.open.mode === 'rolling'}
                            onChange={() => {
                                const prev = bw.open as RollingOpen | BulkOpen;
                                const newOpen: RollingOpen = {
                                    mode: 'rolling',
                                    daysBefore: prev.mode === 'rolling' ? prev.daysBefore : 0,
                                    releaseTime:
                                        prev.mode === 'rolling'
                                            ? prev.releaseTime
                                            : defaultBW.open.releaseTime,
                                };
                                setSettings({ ...settings!, bookingWindow: { ...bw, open: newOpen } });
                            }}
                        />
                        <span className="ml-2">毎日開放</span>
                    </label>
                    {/* ラジオボタン一括 */}
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="openMode"
                            checked={bw.open.mode === 'bulk'}
                            onChange={() => {
                                const prev = bw.open as RollingOpen | BulkOpen;
                                const newOpen: BulkOpen = {
                                    mode: 'bulk',
                                    releaseDayOfMonth:
                                        'releaseDayOfMonth' in prev ? prev.releaseDayOfMonth : 1,
                                    monthsAhead: 'monthsAhead' in prev ? prev.monthsAhead : 1,
                                    releaseTime:
                                        'releaseTime' in prev
                                            ? prev.releaseTime
                                            : defaultBW.open.releaseTime,
                                };
                                setSettings({ ...settings!, bookingWindow: { ...bw, open: newOpen } });
                            }}
                        />
                        <span className="ml-2">一括開放</span>
                    </label>
                </div>
                {bw.open.mode === 'rolling' && (
                    <div className="space-y-2">
                        <Label>何日前から</Label>
                        <Input
                            type="number"
                            value={(bw.open as RollingOpen).daysBefore}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const prev = bw.open as RollingOpen;
                                setSettings({
                                    ...settings!,
                                    bookingWindow: { ...bw, open: { ...prev, daysBefore: Number(e.target.value) } },
                                });
                            }}
                        />
                        <Label>開放時間</Label>
                        <Input
                            type="time"
                            value={(bw.open as RollingOpen).releaseTime}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const prev = bw.open as RollingOpen;
                                setSettings({
                                    ...settings!,
                                    bookingWindow: { ...bw, open: { ...prev, releaseTime: e.target.value } },
                                });
                            }}
                        />
                    </div>
                )}
                {bw.open.mode === 'bulk' && (
                    <div className="space-y-2">
                        <Label>何日に開放</Label>
                        <Input
                            type="number"
                            value={(bw.open as BulkOpen).releaseDayOfMonth}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const prev = bw.open as BulkOpen;
                                setSettings({
                                    ...settings!,
                                    bookingWindow: {
                                        ...bw,
                                        open: { ...prev, releaseDayOfMonth: Number(e.target.value) },
                                    },
                                });
                            }}
                        />
                        <Label>何ヶ月前から</Label>
                        <Input
                            type="number"
                            value={(bw.open as BulkOpen).monthsAhead}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const prev = bw.open as BulkOpen;
                                setSettings({
                                    ...settings!,
                                    bookingWindow: { ...bw, open: { ...prev, monthsAhead: Number(e.target.value) } },
                                });
                            }}
                        />
                        <Label>開放時間</Label>
                        <Input
                            type="time"
                            value={(bw.open as BulkOpen).releaseTime}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const prev = bw.open as BulkOpen;
                                setSettings({
                                    ...settings!,
                                    bookingWindow: {
                                        ...bw,
                                        open: { ...prev, releaseTime: e.target.value },
                                    },
                                });
                            }}
                        />
                    </div>
                )}
            </fieldset>

            {/* 受付終了 */}
            <fieldset className="space-y-2">
                <legend className="font-semibold">予約受付終了</legend>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="closeMode"
                            checked={bw.close.mode === 'rolling'}
                            onChange={() => {
                                const prev = bw.close as RollingClose;
                                const newClose: RollingClose = { mode: 'rolling', hoursBeforeStart: prev.hoursBeforeStart, minutesBeforeStart: prev.minutesBeforeStart };
                                setSettings({ ...settings!, bookingWindow: { ...bw, close: newClose } });
                            }}
                        />
                        <span className="ml-2">当日予約可</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="closeMode"
                            checked={bw.close.mode === 'absolute'}
                            onChange={() => {
                                const prev = bw.close as AbsoluteClose;
                                const newClose: AbsoluteClose = { mode: 'absolute', daysBefore: prev.daysBefore };
                                setSettings({ ...settings!, bookingWindow: { ...bw, close: newClose } });
                            }}
                        />
                        <span className="ml-2">当日予約不可</span>
                    </label>
                </div>
                {bw.close.mode === 'rolling' && (
                    <div className="space-y-2">
                        <Label>何時間前まで</Label>
                        <Input
                            type="number"
                            value={(bw.close as RollingClose).hoursBeforeStart}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const prev = bw.close as RollingClose;
                                setSettings({
                                    ...settings!,
                                    bookingWindow: { ...bw, close: { ...prev, hoursBeforeStart: Number(e.target.value) } },
                                });
                            }}
                        />
                        <Label>何分前まで</Label>
                        <Input
                            type="number"
                            value={(bw.close as RollingClose).minutesBeforeStart}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const prev = bw.close as RollingClose;
                                setSettings({
                                    ...settings!,
                                    bookingWindow: { ...bw, close: { ...prev, minutesBeforeStart: Number(e.target.value) } },
                                });
                            }}
                        />
                    </div>
                )}
                {bw.close.mode === 'absolute' && (
                    <div className="space-y-2">
                        <Label>何日前まで</Label>
                        <Input
                            type="number"
                            value={(bw.close as AbsoluteClose).daysBefore}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const prev = bw.close as AbsoluteClose;
                                setSettings({
                                    ...settings!,
                                    bookingWindow: { ...bw, close: { ...prev, daysBefore: Number(e.target.value) } },
                                });
                            }}
                        />
                    </div>
                )}
            </fieldset>

            {/* キャンセルポリシー */}
            <fieldset className="space-y-2">
                <legend className="font-semibold">キャンセルポリシー</legend>
                <div className="flex items-center space-x-4">
                    <Label>顧客キャンセルを許可</Label>
                    <Switch
                        checked={settings!.cancellationPolicy.enabled}
                        onCheckedChange={(v) => setSettings({
                            ...settings!, cancellationPolicy: { ...settings!.cancellationPolicy, enabled: v }
                        })}
                    />
                </div>
                {settings!.cancellationPolicy.enabled && (
                    <div className="space-y-2">
                        <Label>何日前までキャンセル可</Label>
                        <Input
                            type="number"
                            value={settings!.cancellationPolicy.deadlineBefore!.days}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSettings({
                                ...settings!, cancellationPolicy: {
                                    ...settings!.cancellationPolicy,
                                    deadlineBefore: { ...settings!.cancellationPolicy.deadlineBefore!, days: Number(e.target.value) }
                                }
                            })}
                        />
                    </div>
                )}
            </fieldset>

            {/* 変更ポリシー */}
            <fieldset className="space-y-2">
                <legend className="font-semibold">変更ポリシー</legend>
                <div className="flex items-center space-x-4">
                    <Label>顧客変更を許可</Label>
                    <Switch
                        checked={settings!.modificationPolicy.enabled}
                        onCheckedChange={(v) => setSettings({
                            ...settings!, modificationPolicy: { ...settings!.modificationPolicy, enabled: v }
                        })}
                    />
                </div>
                {settings!.modificationPolicy.enabled && (
                    <div className="space-y-2">
                        <Label>何日前まで変更可</Label>
                        <Input
                            type="number"
                            value={settings!.modificationPolicy.deadlineBefore!.days}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSettings({
                                ...settings!, modificationPolicy: {
                                    ...settings!.modificationPolicy,
                                    deadlineBefore: { ...settings!.modificationPolicy.deadlineBefore!, days: Number(e.target.value) }
                                }
                            })}
                        />
                    </div>
                )}
            </fieldset>

            {/* オプション設定 */}
            <fieldset className="space-y-2">
                <legend className="font-semibold">オプション設定</legend>

                {/* コース選択 */}
                <div className="flex items-center space-x-4">
                    <Label>コース選択を許可</Label>
                    <Switch
                        checked={settings!.allowCourseSelection}
                        onCheckedChange={(v) =>
                            setSettings({ ...settings!, allowCourseSelection: v })
                        }
                    />
                </div>

                {/* 座席指定 */}
                <div className="flex items-center space-x-4">
                    <Label>座席指定を許可</Label>
                    <Switch
                        checked={settings!.allowSeatSelection}
                        onCheckedChange={(v) =>
                            setSettings({ ...settings!, allowSeatSelection: v })
                        }
                    />
                </div>

                {/* 座席組み合わせ */}
                <div className="flex items-center space-x-4">
                    <Label>複数座席組み合わせを許可</Label>
                    <Switch
                        checked={settings!.allowSeatCombination}
                        onCheckedChange={(v) =>
                            setSettings({ ...settings!, allowSeatCombination: v })
                        }
                    />
                </div>

                {/* 最小組み合わせ人数 */}
                {settings!.allowSeatCombination && (
                    <div className="space-y-2">
                        <Label>最小組み合わせ人数</Label>
                        <Input
                            type="number"
                            value={settings!.minCombinationPartySize ?? ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setSettings({
                                    ...settings!,
                                    minCombinationPartySize:
                                        Number(e.target.value) || undefined,
                                })
                            }
                        />
                    </div>
                )}

                {/* 最大組み合わせ席数 */}
                {settings!.allowSeatCombination && (
                    <div className="space-y-2">
                        <Label>最大組み合わせ席数</Label>
                        <Input
                            type="number"
                            value={settings!.maxCombinationSeats ?? ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setSettings({
                                    ...settings!,
                                    maxCombinationSeats:
                                        Number(e.target.value) || undefined,
                                })
                            }
                        />
                    </div>
                )}
            </fieldset>

            {/* 最後の保存ボタン */}
            <div className="pt-4">
                <Button type="submit" disabled={saving} className="w-auto">
                    {saving ? '保存中…' : '設定を保存'}
                </Button>
            </div>
        </form>
    );
}
