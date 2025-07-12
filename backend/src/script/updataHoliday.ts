// scripts/updateHoliday.ts
import { PrismaClient } from '@prisma/client';
// utils のパスは環境に応じて調整してください
import { getHolidaySet } from '../common/utils/holidayUtil';

const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today.getFullYear() + 10, 11, 31);

    // 1. 既存の未来祝日を取得
    const existing = await prisma.holiday.findMany({
        where: { date: { gte: start, lte: end } },
        select: { date: true },
    });
    const existingSet = new Set(
        existing.map(h => h.date.toISOString().slice(0, 10))
    );

    // 2. Google から未来10年分の祝日を取得
    const fetchedSet = new Set<string>();
    for (let y = today.getFullYear(); y <= end.getFullYear(); y++) {
        for (let m = 0; m < 12; m++) {
            const s = await getHolidaySet(y, m);
            s.forEach(d => {
                const key = d;           // "YYYY-MM-DD"
                const dt = new Date(d);
                if (dt >= start && dt <= end) {
                    fetchedSet.add(key);
                }
            });
        }
    }

    // 3. 差分を計算
    const toAdd = Array.from(fetchedSet).filter(d => !existingSet.has(d));
    const toRemove = Array.from(existingSet).filter(d => !fetchedSet.has(d));

    // 4. トランザクションで反映
    await prisma.$transaction([
        prisma.holiday.createMany({
            data: toAdd.map(dateStr => ({
                // ここで文字列 → Date に変換
                date: new Date(dateStr),
            })),
            skipDuplicates: true,
        }),
        prisma.holiday.deleteMany({
            where: { date: { in: toRemove.map(d => new Date(d)) } },
        }),
    ]);

    console.log(`Added: ${toAdd.length}, Removed: ${toRemove.length}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
