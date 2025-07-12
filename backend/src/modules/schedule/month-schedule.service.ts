// backend/src/modules/schedule/month-schedule.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';

interface DayDetail {
    date: string; // YYYY-MM-DD
    isHoliday: boolean;
    status: 'closed' | 'open';
    appliedRuleType: 'specialDay' | 'closedDay' | 'weeklySchedule' | null;
    appliedRuleId: number | null;
    layoutSpans: Array<{ start: string; end: string; layoutId: number }>;
    seatSpans: Array<{ start: string; end: string; seatId: number }>;
}

@Injectable()
export class MonthScheduleService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * 月間スケジュール詳細取得: カレンダーとタイムライン用
     */
    async getMonthDetail(
        storeId: number,
        year: number,
        month: number,
    ): Promise<DayDetail[]> {
        // ストア存在チェック
        const store = await this.prisma.store.findUnique({
            where: { id: BigInt(storeId) },
        });
        if (!store) throw new NotFoundException(`Store ${storeId} not found`);

        // 1) 日付リスト生成
        const days: Date[] = [];
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }

        // 1a) 祝日取得
        const holidayRecords = await this.prisma.holiday.findMany({
            where: {
                date: { gte: new Date(year, month, 1), lt: new Date(year, month + 1, 1) },
            },
            select: { date: true },
        });
        const holidaySet = new Set(
            holidayRecords.map((h) => this.formatDateLocal(h.date)),
        );

        // 2) 他データ一括取得
        const [specialDays, layoutGroups, closedGroups, layoutSeats] =
            await Promise.all([
                this.prisma.specialDay.findMany({
                    where: { storeId: BigInt(storeId), date: { in: days } },
                    include: { schedules: true },
                    orderBy: { date: 'asc' },
                }),
                this.prisma.layoutScheduleGroup.findMany({
                    where: { storeId: BigInt(storeId), effectiveFrom: { lte: last } },
                    include: { schedules: true },
                    orderBy: { effectiveFrom: 'asc' },
                }),
                this.prisma.closedDayGroup.findMany({
                    where: { storeId: BigInt(storeId), effectiveFrom: { lte: last } },
                    include: { rules: true },
                    orderBy: { effectiveFrom: 'asc' },
                }),
                this.prisma.layoutSeat.findMany({
                    where: { layout: { storeId: BigInt(storeId) } },
                }),
            ]);

        // レイアウト⇔座席マップ
        const layoutSeatMap: Record<number, number[]> = {};
        layoutSeats.forEach((ls) => {
            const lid = Number(ls.layoutId);
            layoutSeatMap[lid] ??= [];
            layoutSeatMap[lid].push(Number(ls.seatId));
        });

        // 3a) DayDetail 初期化
        const details: Record<string, DayDetail> = {};
        days.forEach((date) => {
            const key = this.formatDateLocal(date);
            details[key] = {
                date: key,
                isHoliday: holidaySet.has(key),
                status: 'closed',
                appliedRuleType: null,
                appliedRuleId: null,
                layoutSpans: [],
                seatSpans: [],
            };
        });

        // 3b) 特別日適用
        specialDays.forEach((sd) => {
            const key = this.formatDateLocal(sd.date);
            const day = details[key];
            if (!day) return;
            day.appliedRuleType = 'specialDay';
            day.appliedRuleId = Number(sd.id);
            if (sd.type === 'BUSINESS') {
                day.status = 'open';
                day.layoutSpans = sd.schedules.map((sch) => ({
                    start: this.formatTimeUTC(sch.startTime),
                    end: this.formatTimeUTC(sch.endTime),
                    layoutId: Number(sch.layoutId),
                }));
                day.seatSpans = day.layoutSpans.flatMap((span) =>
                    (layoutSeatMap[span.layoutId] || []).map((seatId) => ({
                        start: span.start,
                        end: span.end,
                        seatId,
                    })),
                );
            }
        });

        // 3c) 定休日適用
        days.forEach((date) => {
            const key = this.formatDateLocal(date);
            const day = details[key];
            if (!day || day.appliedRuleType === 'specialDay') return;
            const group = this.pickLatest(closedGroups, date);
            if (!group) return;
            const rule = group.rules.find((r) => this.isClosedDay(date, r));
            if (rule) {
                day.appliedRuleType = 'closedDay';
                day.appliedRuleId = Number(rule.id);
                day.status = 'closed';
            }
        });

        // 3d) 週次スケジュール適用（複数時間帯対応）
        days.forEach((date) => {
            const key = this.formatDateLocal(date);
            const day = details[key];
            if (!day || day.appliedRuleType) return;
            const lg = this.pickLatest(layoutGroups, date);
            if (!lg) return;

            const dow = date.getDay();                // 0=日曜…6=土曜
            const dayKey = day.isHoliday && lg.applyOnHoliday ? 7 : dow;
            const scheds = lg.schedules.filter((s) => s.dayOfWeek === dayKey);
            if (scheds.length === 0) return;

            day.appliedRuleType = 'weeklySchedule';
            day.appliedRuleId = Number(lg.id);
            day.status = 'open';
            day.layoutSpans = scheds.map((sched) => ({
                start: this.formatTimeUTC(sched.startTime),
                end: this.formatTimeUTC(sched.endTime!),
                layoutId: Number(sched.layoutId),
            }));
            day.seatSpans = day.layoutSpans.flatMap((span) =>
                (layoutSeatMap[span.layoutId] || []).map((seatId) => ({
                    start: span.start,
                    end: span.end,
                    seatId,
                })),
            );
        });

        // 4) レスポンス返却
        return Object.values(details);
    }

    /** UTC から "HH:mm" を取り出す */
    private formatTimeUTC(d: Date): string {
        return d.toISOString().slice(11, 16);
    }

    /** ローカル日付を "YYYY-MM-DD" 形式で取得 */
    private formatDateLocal(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    /** 指定日の最新グループを選択 */
    private pickLatest<T extends { effectiveFrom: Date }>(
        groups: T[],
        date: Date,
    ): T | undefined {
        return groups.filter((g) => g.effectiveFrom <= date).pop();
    }

    /** 定休日判定 */
    private isClosedDay(
        date: Date,
        rule: {
            type: string;
            dayOfWeek?: number | null;
            dayOfMonth?: number | null;
            weekOfMonth?: number | null;
        },
    ): boolean {
        const dow = date.getDay();
        const dom = date.getDate();
        const lastDom = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const wom = Math.ceil(dom / 7);

        switch (rule.type) {
            case 'WEEKLY':
                return rule.dayOfWeek === dow;
            case 'MONTHLY_DATE':
                return rule.dayOfMonth === dom || (rule.dayOfMonth === 99 && dom === lastDom);
            case 'MONTHLY_NTH_WEEK':
                return rule.weekOfMonth === wom && rule.dayOfWeek === dow;
            default:
                return false;
        }
    }
}
