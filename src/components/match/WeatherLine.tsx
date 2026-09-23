import type { Weather } from '../../utils/weather';

/** キックオフ時刻の予報（1行）。onDark=true で黒背景用の配色にする */
export const WeatherLine = ({ w, onDark }: { w: Weather; onDark?: boolean }) => (
  <div className={`wx${onDark ? ' wx-dark' : ''}`}>
    <span className="wx-icon" aria-hidden>{w.icon}</span>
    <span className="wx-label">{w.label}</span>
    <span className="wx-sep" aria-hidden>·</span>
    <span className="num wx-temp">{w.temp}°</span>
    <span className={`num wx-pop${w.rainy || w.pop >= 50 ? ' wet' : ''}`}>降水{w.pop}%</span>
    <span className="num wx-wind">風{w.wind}m</span>
  </div>
);
