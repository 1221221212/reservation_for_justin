import { google } from 'googleapis';

const CALENDAR_ID = 'japanese__ja@holiday.calendar.google.com';

/**
 * 指定年月の祝日を取得して "YYYY-MM-DD" の文字列セットを返します。
 * 
 * 事前に以下のいずれかの認証情報を環境変数で設定しておいてください:
 * - GOOGLE_API_KEY=（APIキー）
 * - GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 */
export async function getHolidaySet(year: number, month: number): Promise<Set<string>> {
    // 取得範囲：当月1日 00:00 ～ 翌月1日 00:00
    const timeMin = new Date(year, month, 1).toISOString();
    const timeMax = new Date(year, month + 1, 1).toISOString();

    // 認証クライアントの初期化
    const auth = process.env.GOOGLE_API_KEY
        ? new google.auth.GoogleAuth({ apiKey: process.env.GOOGLE_API_KEY })
        : new google.auth.GoogleAuth();

    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
    });

    const items = res.data.items || [];
    const set = new Set<string>();
    for (const ev of items) {
        // 祝日カレンダーのイベントは all-day なので ev.start.date に日付文字列が入っています
        if (ev.start?.date) {
            set.add(ev.start.date);
        }
    }
    return set;
}
