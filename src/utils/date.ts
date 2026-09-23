const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];
/** 曜日表示用（カレンダーのヘッダなど） */
export const WEEK = WEEKDAYS_JA;
const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** ISO 文字列 → Date（日付のみの場合は JST 00:00 として扱う） */
export const parseKickoff = (iso: string): Date =>
  iso.length <= 10 ? new Date(`${iso}T00:00:00+09:00`) : new Date(iso);

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const fmtTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
export const fmtMonthDay = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
export const fmtDateJa = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS_JA[d.getDay()]})`;
export const fmtDateFull = (d: Date) =>
  `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS_JA[d.getDay()]})`;
export const weekdayJa = (d: Date) => WEEKDAYS_JA[d.getDay()]!;
export const weekdayEn = (d: Date) => WEEKDAYS_EN[d.getDay()]!;

/** 'YYYY-MM' キー（月セレクタ用） */
export const monthKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
export const monthLabel = (key: string) => {
  const [y, m] = key.split('-');
  return { year: y!, month: `${Number(m)}月` };
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export interface Countdown { days: number; hours: number; minutes: number; seconds: number; total: number }

export const countdownTo = (target: Date, now: Date = new Date()): Countdown => {
  const total = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(total / 1000);
  return {
    total,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
};

/** 試合時間中とみなす窓（キックオフ前 0 分〜後 130 分） */
export const MATCH_WINDOW_MS = 130 * 60 * 1000;
