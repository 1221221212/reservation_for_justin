// src/lib/schedule-utils.ts

/**
 * "HH:mm" 形式の時刻文字列をグリッドの行インデックス（0.5単位）に変換します。
 * @param time "HH:mm" 形式の文字列
 * @returns グリッドの行インデックス
 */
export function timeToRow(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 2 + m / 30;
}

/**
 * グリッドの行インデックスを "HH:mm" 形式の時刻文字列に変換します。
 * @param row グリッドの行インデックス
 * @returns "HH:mm" 形式の文字列
 */
export function rowToTime(row: number): string {
    const h = Math.floor(row / 2);
    const m = row % 2 === 1 ? 30 : 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * 5分刻みの時刻選択肢リスト（"HH:mm" 形式）
 */
export const timeOptions: string[] = Array.from({ length: 24 * 12 }).map((_, idx) => {
    const h = Math.floor(idx / 12);
    const m = (idx % 12) * 5;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});
