// src/app/admin/store/[storeId]/schedule/closed/new/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ClosedDayType,
    ClosedDayRule,
    CreateClosedDayGroupDto,
} from '@/types/closed-day';
import { createClosedDayGroup } from '@/lib/closed-day-api';

export default function ClosedDaysNewPage() {
    const { storeId } = useParams();
    const router = useRouter();

    const today = new Date().toISOString().split('T')[0];
    const [effectiveFrom, setEffectiveFrom] = useState<string>(today);

    // 1: WEEKLY days (日0〜土6, 祝7)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土', '祝'];
    const [weekly, setWeekly] = useState<boolean[]>(new Array(8).fill(false));

    // 2: MONTHLY_DATE days (1〜31, 月末=99)
    const monthDays = Array.from({ length: 31 }, (_, i) => i + 1).concat(99);
    const [monthlyDate, setMonthlyDate] = useState<Record<number, boolean>>(
        monthDays.reduce((acc, d) => ({ ...acc, [d]: false }), {} as Record<number, boolean>)
    );

    // 3: MONTHLY_NTH_WEEK (第1〜5週 × 日0〜土6)
    const weeks = [1, 2, 3, 4, 5];
    const [monthlyNth, setMonthlyNth] = useState<Record<string, boolean>>(
        weeks
            .flatMap(w => weekdays.slice(0, 7).map((_, d) => `${w}-${d}`))
            .reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<string, boolean>)
    );

    const toggleWeekly = (idx: number) =>
        setWeekly(prev => prev.map((v, i) => (i === idx ? !v : v)));

    const toggleMonthlyDate = (d: number) =>
        setMonthlyDate(prev => ({ ...prev, [d]: !prev[d] }));

    const toggleMonthlyNth = (week: number, day: number) => {
        const key = `${week}-${day}`;
        setMonthlyNth(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async () => {
        const rules: ClosedDayRule[] = [];

        // WEEKLY rules
        weekly.forEach((checked, idx) => {
            if (checked) {
                rules.push({ type: ClosedDayType.WEEKLY, dayOfWeek: idx });
            }
        });

        // MONTHLY_DATE rules
        Object.entries(monthlyDate).forEach(([key, checked]) => {
            if (checked) {
                rules.push({ type: ClosedDayType.MONTHLY_DATE, dayOfMonth: Number(key) });
            }
        });

        // MONTHLY_NTH_WEEK rules
        Object.entries(monthlyNth).forEach(([key, checked]) => {
            if (checked) {
                const [weekOfMonth, dayOfWeek] = key.split('-').map(Number);
                rules.push({
                    type: ClosedDayType.MONTHLY_NTH_WEEK,
                    weekOfMonth,
                    dayOfWeek,
                });
            }
        });

        const payload: CreateClosedDayGroupDto = { effectiveFrom, rules };
        await createClosedDayGroup(Number(storeId), payload);
        router.push(`/admin/store/${storeId}/schedule/closed`);
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-xl font-bold">定期休業 新規作成</h1>

            {/* 1. 適用開始日 */}
            <section>
                <label className="block mb-2">
                    <span className="text-sm font-medium">適用開始日</span>
                    <input
                        type="date"
                        className="mt-1 p-2 border rounded"
                        value={effectiveFrom}
                        onChange={e => setEffectiveFrom(e.target.value)}
                    />
                </label>
            </section>

            {/* 2. 週次の休み */}
            <section>
                <h2 className="font-semibold mb-2">毎週の定休</h2>
                <div className="grid grid-cols-8 gap-2">
                    {weekdays.map((label, idx) => (
                        <label key={idx} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={weekly[idx]}
                                onChange={() => toggleWeekly(idx)}
                                className="mr-1"
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </section>

            {/* 3. 月次の休み１ */}
            <section>
                <h2 className="font-semibold mb-2">毎月の日付休</h2>
                <div className="grid grid-cols-8 gap-2 max-h-48 overflow-auto">
                    {monthDays.map(d => (
                        <label key={d} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={monthlyDate[d]}
                                onChange={() => toggleMonthlyDate(d)}
                                className="mr-1"
                            />
                            <span>{d === 99 ? '末日' : d}</span>
                        </label>
                    ))}
                </div>
            </section>

            {/* 4. 月次の休み２ */}
            <section>
                <h2 className="font-semibold mb-2">毎月N番目のX曜日の休み（第一日曜日など）</h2>
                <table className="border-collapse w-full text-xs">
                    <thead>
                        <tr>
                            <th></th>
                            {weekdays.slice(0, 7).map((d, i) => (
                                <th key={i} className="border p-1">{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map(w => (
                            <tr key={w}>
                                <td className="border p-1">第{w}</td>
                                {weekdays.slice(0, 7).map((_, day) => (
                                    <td key={day} className="border p-1 text-center">
                                        <input
                                            type="checkbox"
                                            checked={monthlyNth[`${w}-${day}`]}
                                            onChange={() => toggleMonthlyNth(w, day)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    保存
                </button>
            </div>
        </div>
    );
}
