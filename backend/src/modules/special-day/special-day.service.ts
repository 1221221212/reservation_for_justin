// src/modules/special-day/special-day.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CreateSpecialDayDto } from './dto/create-special-day.dto';

/**
 * 特別日のスケジュール情報を返す型
 */
type SpecialDayScheduleInfo = {
    id: number;
    layoutId: number;
    startTime: string;  // "HH:mm"
    endTime: string;    // "HH:mm"
};

/**
 * 特別日の情報を返す型
 */
export type SpecialDayInfo = {
    id: number;
    date: string;               // YYYY-MM-DD
    type: 'BUSINESS' | 'CLOSED';
    reason?: string;
    schedules: SpecialDayScheduleInfo[];
};

@Injectable()
export class SpecialDayService {
    constructor(private readonly prisma: PrismaService) { }

    /** 全特別日を取得 */
    async findAll(storeId: number): Promise<SpecialDayInfo[]> {
        const list = await this.prisma.specialDay.findMany({
            where: { storeId: BigInt(storeId) },
            include: { schedules: true },
            orderBy: { date: 'asc' },
        });
        return list.map(sd => this.toInfo(sd));
    }

    /** 単一の特別日を取得 */
    async findOne(storeId: number, id: number): Promise<SpecialDayInfo> {
        const sd = await this.prisma.specialDay.findFirst({
            where: { id: BigInt(id), storeId: BigInt(storeId) },
            include: { schedules: true },
        });
        if (!sd) {
            throw new NotFoundException(`SpecialDay ${id} not found in store ${storeId}`);
        }
        return this.toInfo(sd);
    }

    /** 新しい特別日を作成 */
    async create(storeId: number, dto: CreateSpecialDayDto): Promise<SpecialDayInfo> {
        return await this.prisma.$transaction(async tx => {
            const existing = await tx.specialDay.findUnique({
                where: {
                    storeId_date: {
                        storeId: BigInt(storeId),
                        date: new Date(dto.date),
                    },
                },
            });

            // ── ① 既存あって override=false ならエラー ──
            if (existing && !dto.override) {
                throw new ConflictException(
                    'この日付は既に特別日として登録されています'
                );
            }

            // 上書きする場合は、まずスケジュールを削除してから特別日を削除
            if (existing && dto.override) {
                await tx.specialDaySchedule.deleteMany({
                    where: { specialDayId: existing.id },
                });
                await tx.specialDay.delete({
                    where: { id: existing.id },
                });
            }

            // 新規作成
            const created = await tx.specialDay.create({
                data: {
                    storeId: BigInt(storeId),
                    date: new Date(dto.date),
                    type: dto.type,
                    reason: dto.reason,
                },
            });

            // BUSINESS の場合はスケジュールも登録
            if (dto.type === 'BUSINESS' && dto.schedules?.length) {
                await tx.specialDaySchedule.createMany({
                    data: dto.schedules.map(sch => ({
                        specialDayId: created.id,
                        layoutId: BigInt(sch.layoutId),
                        startTime: this.parseTime(sch.startTime),
                        endTime: this.parseTime(sch.endTime),
                    })),
                });
            }

            const full = await tx.specialDay.findUnique({
                where: { id: created.id },
                include: { schedules: true },
            });
            return this.toInfo(full!);
        });
    }

    /** 特別日を更新 */
    async update(storeId: number, id: number, dto: CreateSpecialDayDto): Promise<SpecialDayInfo> {
        return await this.prisma.$transaction(async tx => {
            const exists = await tx.specialDay.findFirst({
                where: { id: BigInt(id), storeId: BigInt(storeId) },
            });
            if (!exists) {
                throw new NotFoundException(`SpecialDay ${id} not found in store ${storeId}`);
            }

            const updated = await tx.specialDay.update({
                where: { id: BigInt(id) },
                data: { date: new Date(dto.date), type: dto.type },
            });

            // 既存スケジュールを全削除し再作成
            await tx.specialDaySchedule.deleteMany({ where: { specialDayId: updated.id } });
            if (dto.type === 'BUSINESS' && dto.schedules?.length) {
                await tx.specialDaySchedule.createMany({
                    data: dto.schedules.map(sch => ({
                        specialDayId: updated.id,
                        layoutId: BigInt(sch.layoutId),
                        startTime: this.parseTime(sch.startTime),
                        endTime: this.parseTime(sch.endTime),
                    })),
                });
            }

            const full = await tx.specialDay.findUnique({
                where: { id: updated.id },
                include: { schedules: true },
            });
            return this.toInfo(full!);
        });
    }

    /** 特別日を削除 */
    async remove(storeId: number, id: number): Promise<void> {
        const exists = await this.prisma.specialDay.findFirst({
            where: { id: BigInt(id), storeId: BigInt(storeId) },
        });
        if (!exists) {
            throw new NotFoundException(`SpecialDay ${id} not found in store ${storeId}`);
        }
        await this.prisma.specialDay.delete({ where: { id: BigInt(id) } });
    }

    /** "HH:mm" 文字列を Date オブジェクトに変換 */
    private parseTime(value: string): Date {
        // タイムゾーン補正を防ぐため、ダミー日付＋UTC時刻文字列から Date を生成
        // 例: "13:30" → new Date("1970-01-01T13:30:00Z")
        return new Date(`1970-01-01T${value}:00Z`);
    }

    /** Prisma レコードを SpecialDayInfo 型に変換 */
    private toInfo(rec: any): SpecialDayInfo {
        return {
            id: Number(rec.id),
            date: rec.date.toISOString().slice(0, 10),
            type: rec.type,
            reason: rec.reason ?? null,
            schedules: rec.schedules.map((sc: any) => ({
                id: Number(sc.id),
                layoutId: Number(sc.layoutId),
                startTime: sc.startTime.toISOString().slice(11, 16),
                endTime: sc.endTime.toISOString().slice(11, 16),
            })),
        };
    }
}
