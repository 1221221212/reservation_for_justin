'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAvailabilityDay, fetchNextStepFlags } from '@/lib/reservation-api';
import type {
    SeatFirstSpan,
    AvailabilityDayResponse,
    NextStepFlags,
} from '@/types/reservation';

/** "HH:mm" → 分 に変換 */
const parseTime = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

export default function ReserveTimePage() {
    const { storeId, date } = useParams<{ storeId: string; date: string }>();
    const router = useRouter();
    const sid = Number(storeId);

    // 1) 人数選択
    const [partySize, setPartySize] = useState<number>(1);

    // 2) バックエンドから受け取る設定値とビジネスアワー
    const [gridUnit, setGridUnit] = useState<number>(15);
    const [standardMinutes, setStandardMinutes] = useState<number>(60);
    const [bufferSlots, setBufferSlots] = useState<number>(1);
    const [businessHours, setBusinessHours] = useState<
        Array<{ start: string; end: string }>
    >([]);

    // 3) 生スパン (フィルタ前)
    const [rawSpans, setRawSpans] = useState<SeatFirstSpan[]>([]);

    // 4) グリッド時間リストと可用性判定
    const [slots, setSlots] = useState<
        Array<{ time: string; available: boolean }>
    >([]);

    // ──────────────────────────────────────────────────
    // API 呼び出し：日別可用性取得
    useEffect(() => {
        if (isNaN(sid) || !date) return;

        fetchAvailabilityDay(sid, date, partySize)
            .then((res) => {
                const body = res.data as AvailabilityDayResponse;
                setGridUnit(body.settings.gridUnit);
                setStandardMinutes(body.settings.standardReservationMinutes);
                setBufferSlots(body.settings.bufferSlots);
                setBusinessHours(body.businessHours);
                setRawSpans(body.data);
            })
            .catch((e) => console.error('日別可用性取得失敗:', e));
    }, [sid, date, partySize]);

    // スロット計算
    useEffect(() => {
        if (!businessHours.length) return;

        const newSlots: Array<{ time: string; available: boolean }> = [];

        businessHours.forEach(({ start, end }) => {
            const sMin = parseTime(start);
            const eMin = parseTime(end);

            for (let t = sMin; t + standardMinutes <= eMin; t += gridUnit) {
                const hh = String(Math.floor(t / 60)).padStart(2, '0');
                const mm = String(t % 60).padStart(2, '0');
                const time = `${hh}:${mm}`;

                const available = rawSpans.some(({ spans }) =>
                    spans.some(({ start: s, end: e2 }) => {
                        const spanStart = parseTime(s);
                        const spanEnd = parseTime(e2);
                        return t >= spanStart && t + standardMinutes <= spanEnd;
                    })
                );

                newSlots.push({ time, available });
            }
        });

        setSlots(newSlots);
    }, [businessHours, rawSpans, gridUnit, standardMinutes]);

    // 時刻選択ハンドラ
    const handleSelect = async (time: string) => {
        if (!slots.find((s) => s.time === time)?.available) return;

        try {
            const { data } = await fetchNextStepFlags(sid);
            const { allowCourseSelection, allowSeatSelection } =
                data as NextStepFlags;

            if (allowCourseSelection) {
                router.push(
                    `/store/${sid}/reserve/${date}/course?time=${time}&partySize=${partySize}`
                );
            } else if (allowSeatSelection) {
                router.push(
                    `/store/${sid}/reserve/${date}/select?time=${time}&partySize=${partySize}`
                );
            } else {
                router.push(
                    `/store/${sid}/reserve/${date}/info?time=${time}&partySize=${partySize}`
                );
            }
        } catch (e) {
            console.error('次のステップ取得失敗:', e);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">
                店舗 {sid} / {date} の時間選択
            </h1>

            {/* 人数選択 */}
            <div className="mb-4">
                <label htmlFor="partySize" className="mr-2 font-medium">
                    人数：
                </label>
                <select
                    id="partySize"
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="border p-1 rounded"
                >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                            {n}名
                        </option>
                    ))}
                </select>
            </div>

            {/* 時間枠リスト */}
            <ul className="grid grid-cols-4 gap-2">
                {slots.map(({ time, available }) => (
                    <li
                        key={time}
                        className={`p-2 border text-center rounded cursor-pointer ${available
                                ? 'bg-green-100 hover:bg-green-200'
                                : 'bg-gray-200 cursor-not-allowed'
                            }`}
                        onClick={() => handleSelect(time)}
                    >
                        {available ? '○' : '×'} {time}
                    </li>
                ))}
            </ul>
        </div>
    );
}
