/**
 * Open-Meteo（APIキー不要・無料）でキックオフ時刻の予報を取得する。
 * 予報は約16日先まで。それ以降・取得失敗時は null を返し、UI では何も出さない。
 */

export interface Weather {
  /** WMO weather code */
  code: number;
  label: string;
  icon: string;
  temp: number;
  /** 降水確率 % */
  pop: number;
  /** 風速 m/s */
  wind: number;
  /** 傘が要るか（掲示用） */
  rainy: boolean;
}

export const FORECAST_DAYS = 16;

/** WMO weather code → 日本語ラベルと絵記号 */
const WMO: Record<number, [string, string]> = {
  0: ['快晴', '☀'],
  1: ['晴れ', '🌤'], 2: ['薄曇り', '⛅'], 3: ['曇り', '☁'],
  45: ['霧', '🌫'], 48: ['霧', '🌫'],
  51: ['霧雨', '🌦'], 53: ['霧雨', '🌦'], 55: ['霧雨', '🌦'],
  56: ['着氷性の霧雨', '🌧'], 57: ['着氷性の霧雨', '🌧'],
  61: ['小雨', '🌦'], 63: ['雨', '🌧'], 65: ['強い雨', '🌧'],
  66: ['着氷性の雨', '🌧'], 67: ['着氷性の雨', '🌧'],
  71: ['小雪', '🌨'], 73: ['雪', '🌨'], 75: ['大雪', '❄'], 77: ['霧雪', '🌨'],
  80: ['にわか雨', '🌦'], 81: ['にわか雨', '🌧'], 82: ['激しいにわか雨', '⛈'],
  85: ['にわか雪', '🌨'], 86: ['にわか雪', '🌨'],
  95: ['雷雨', '⛈'], 96: ['雷雨（ひょう）', '⛈'], 99: ['雷雨（ひょう）', '⛈'],
};

const RAINY_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

const pad = (n: number) => String(n).padStart(2, '0');

/** UTC の 'YYYY-MM-DDTHH:00' — Open-Meteo の hourly.time と突き合わせる */
const utcHourKey = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:00`;

const utcDate = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

interface Hourly {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
}

const cache = new Map<string, Weather | null>();

export const isForecastable = (kickoff: Date, now: Date = new Date()) => {
  const diff = kickoff.getTime() - now.getTime();
  return diff > -3 * 60 * 60 * 1000 && diff < FORECAST_DAYS * 24 * 60 * 60 * 1000;
};

export const fetchWeather = async (
  lat: number, lng: number, kickoff: Date, signal?: AbortSignal,
): Promise<Weather | null> => {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${utcHourKey(kickoff)}`;
  if (cache.has(key)) return cache.get(key)!;

  // 予報の端で取りこぼさないよう前後1日を含めて要求する
  const from = new Date(kickoff.getTime() - 24 * 60 * 60 * 1000);
  const to = new Date(kickoff.getTime() + 24 * 60 * 60 * 1000);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    '&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m' +
    `&timezone=UTC&start_date=${utcDate(from)}&end_date=${utcDate(to)}&wind_speed_unit=ms`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { hourly?: Hourly };
    const h = json.hourly;
    const i = h?.time.indexOf(utcHourKey(kickoff)) ?? -1;
    if (!h || i < 0) { cache.set(key, null); return null; }

    const code = h.weather_code[i] ?? 3;
    const [label, icon] = WMO[code] ?? ['—', '·'];
    const w: Weather = {
      code, label, icon,
      temp: Math.round(h.temperature_2m[i] ?? 0),
      pop: Math.round(h.precipitation_probability[i] ?? 0),
      wind: Math.round(h.wind_speed_10m[i] ?? 0),
      rainy: RAINY_CODES.has(code),
    };
    cache.set(key, w);
    return w;
  } catch {
    return null; // 取得できなければ表示しない（オフラインでもアプリは動く）
  }
};

/** 予報に応じた一言アドバイス（持ち物） */
export const weatherTip = (w: Weather): string | null => {
  if (w.rainy || w.pop >= 60) return 'カッパ推奨（傘は他のお客様の迷惑になります）';
  if (w.temp <= 5) return '防寒しっかり。カイロとブランケットを';
  if (w.temp >= 30) return '暑さ対策を。帽子と水分を忘れずに';
  if (w.wind >= 8) return '風が強い予報。羽織るものを';
  return null;
};
