// backend/src/modules/reservation/reservation.service.ts
// backend/src/modules/reservation/reservation.service.ts
import {
    Injectable,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';                    // Prismaエラー型
import { PrismaService } from '@/prisma-client/prisma.service';
import { RedisService } from '@/common/services/redis.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    private async lockSeatDate(tx: any, seatId: bigint, date: Date) {
        const key = Number(seatId) ^ date.getTime();
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${key})`;
    }

    private generateRandom3(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 3 })
            .map(() => chars[Math.floor(Math.random() * chars.length)])
            .join('');
    }

    async create(dto: CreateReservationDto) {
        const dateObj = new Date(dto.date);
        const startTs = new Date(`${dto.date}T${dto.startTime}:00`);
        const endTs = new Date(`${dto.date}T${dto.endTime}:00`);

        try {
            const { reservationCode } = await this.prisma.$transaction(async (tx) => {
                // 1) アドバイザリロック＋重複チェック
                for (const sid of dto.seatIds) {
                    await this.lockSeatDate(tx, BigInt(sid), dateObj);
                    const conflict = await tx.reservationSeat.findFirst({
                        where: {
                            seatId: BigInt(sid),
                            date: dateObj,
                            startTime: { lt: endTs },
                            endTime: { gt: startTs },
                            reservation: { status: 'booked' },
                        },
                    });
                    if (conflict) {
                        throw new ConflictException(
                            `席 ${sid} の ${dto.startTime}～${dto.endTime} は既に予約済みです。`
                        );
                    }
                }

                // 2) 予約ヘッダ作成
                const header = await tx.reservation.create({
                    data: {
                        storeId: BigInt(dto.storeId),
                        courseId: dto.courseId ? BigInt(dto.courseId) : undefined,
                        numPeople: dto.partySize,
                        customerName: dto.customerName,
                        customerEmail: dto.customerEmail,
                        customerPhone: dto.customerPhone,
                        customerMemo: dto.customerMemo,
                    },
                });

                // 3) reservationCode 生成＆更新
                const code = `R${this.generateRandom3()}${header.id}`;
                await tx.reservation.update({
                    where: { id: header.id },
                    data: { reservationCode: code },
                });

                // 4) 座席明細作成
                for (const sid of dto.seatIds) {
                    await tx.reservationSeat.create({
                        data: {
                            reservationId: header.id,
                            seatId: BigInt(sid),
                            date: dateObj,
                            startTime: startTs,
                            endTime: endTs,
                        },
                    });
                }

                return { reservationCode: code };
            });

            // 5) キャッシュクリア

            // 日別
            const dayPattern = `availability:day:${dto.storeId}:${dto.date}:*`;
            const dayKeys = await this.redis.clientRaw.keys(dayPattern);
            if (dayKeys.length > 0) {
                await this.redis.clientRaw.del(dayKeys);
            }

            // 月別
            const [YYYY, MM] = dto.date.split('-');
            const monthPattern = `availability:month:${dto.storeId}:${YYYY}-${MM}:*`;
            const monthKeys = await this.redis.clientRaw.keys(monthPattern);
            if (monthKeys.length > 0) {
                await this.redis.clientRaw.del(monthKeys);
            }

            return { reservationCode };
        } catch (err: any) {
            // DB 排他制約違反 (no_overlap) を 409 に
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002' &&
                Array.isArray(err.meta?.target) &&
                err.meta.target.includes('no_overlap')
            ) {
                throw new ConflictException('指定の時間帯は重複しています。');
            }
            throw err;
        }
    }


    /**
     * 月単位予約取得
     */
    async findMonthly(storeId: number, year: number, month1to12: number) {
        const start = new Date(year, month1to12 - 1, 1);
        const end = new Date(year, month1to12, 1);
        return this.prisma.reservation.findMany({
            where: {
                storeId: BigInt(storeId),
                reservationSeats: {
                    some: { date: { gte: start, lt: end } },
                },
            },
            include: { reservationSeats: true },
        });
    }

    /**
     * 予約詳細取得 （reservationCode で検索）
     */
    async findByCode(code: string) {
        const res = await this.prisma.reservation.findUnique({
            where: { reservationCode: code },
            include: { reservationSeats: true },
        });
        if (!res) {
            throw new BadRequestException(`Reservation ${code} not found`);
        }
        return res;
    }
}
