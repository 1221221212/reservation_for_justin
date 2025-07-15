// src/script/seedHoliday.ts
import { PrismaClient } from '@prisma/client';
import { getHolidaySet } from '../common/utils/holiday-utils';

const prisma = new PrismaClient();

async function main() {
    const startYear = new Date().getFullYear() - 10;
    const endYear = new Date().getFullYear() + 10;
    const records: { date: Date }[] = [];

    for (let y = startYear; y <= endYear; y++) {
        for (let m = 0; m < 12; m++) {
            const set = await getHolidaySet(y, m);
            set.forEach(dateStr =>
                // ここで文字列 → Date に変換
                records.push({ date: new Date(dateStr) })
            );
        }
    }

    // 重複を排除して一括登録
    const unique = Array.from(
        new Map(records.map(r => [r.date.toISOString().slice(0, 10), r])).values()
    );

    await prisma.holiday.createMany({
        data: unique,
        skipDuplicates: true,
    });

    console.log(`Seeded ${unique.length} holidays from ${startYear} to ${endYear}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
