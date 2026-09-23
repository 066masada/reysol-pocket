import { useState } from 'react';
import type { Fixture } from '../../types';
import { ACLE_OPPONENTS, KASHIWA_POINT } from '../../data/acle';
import { MAP, SHAPES, project } from '../../data/acle-map';
import { getClub } from '../../data/clubs';
import { isHome, kickoffDate, opponentId } from '../../utils/fixtures';
import { fmtMonthDay } from '../../utils/date';

/** 2点間の距離（km） */
const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
};

/** 指定がなければ右側に置く */
const DEFAULT_LABEL = { dx: 13, dy: 7, anchor: 'start' } as const;

interface Props {
  /** ACLEの全試合（相手とMDを引くため） */
  fixtures: Fixture[];
  onOpen: (id: string) => void;
}

/**
 * 対戦相手のホームタウンを示す地図。
 * ACLEは相手の国すら分かりにくいので、まず「どこなのか」を見せる。
 */
export const AcleMap = ({ fixtures, onOpen }: Props) => {
  const [active, setActive] = useState<string | null>(null);

  const kashiwa = project(KASHIWA_POINT.lng, KASHIWA_POINT.lat);

  const points = fixtures
    .map((f) => {
      const id = opponentId(f);
      const meta = ACLE_OPPONENTS[id];
      if (!meta) return null;
      const [x, y] = project(meta.lng, meta.lat);
      return {
        id, f, meta, x, y,
        md: f.round.replace('LS-', ''),
        away: !isHome(f),
        km: distanceKm(KASHIWA_POINT, meta),
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const sel = points.find((p) => p.id === active);

  return (
    <figure className="map">
      <figcaption>
        対戦相手のホームタウン
        <span className="note">タップで詳しく</span>
      </figcaption>

      <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} role="img" aria-label="対戦相手8クラブのホームタウンを示したアジア・オセアニアの地図">
        <g className="map-land">
          {SHAPES.map((s) => (
            <path key={s.name} d={s.d} className={s.highlight ? 'map-country on' : 'map-country'} />
          ))}
        </g>

        {/* 柏からの線 */}
        <g className="map-lines">
          {points.map((p) => (
            <line key={p.id} x1={kashiwa[0]} y1={kashiwa[1]} x2={p.x} y2={p.y}
              className={`map-line${p.id === active ? ' on' : ''}`} />
          ))}
        </g>

        {/* 相手 */}
        {points.map((p) => (
          <g key={p.id} className={`map-pin${p.id === active ? ' on' : ''}`}
            onClick={() => setActive(p.id === active ? null : p.id)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActive(p.id === active ? null : p.id); }}>
            <circle cx={p.x} cy={p.y} r={24} className="map-hit" />
            <circle cx={p.x} cy={p.y} r={p.id === active ? 10 : 7.5} className="map-dot" />
            <text
              x={p.x + (p.meta.label ?? DEFAULT_LABEL).dx}
              y={p.y + (p.meta.label ?? DEFAULT_LABEL).dy}
              textAnchor={(p.meta.label ?? DEFAULT_LABEL).anchor}
              className="map-label"
            >
              {p.meta.short}
            </text>
          </g>
        ))}

        {/* 柏 */}
        <g className="map-home">
          <circle cx={kashiwa[0]} cy={kashiwa[1]} r={12} className="map-home-dot" />
          <text x={kashiwa[0] + 17} y={kashiwa[1] - 10} className="map-label home">柏</text>
        </g>
      </svg>

      {sel ? (
        <button type="button" className="map-detail" onClick={() => onOpen(sel.f.id)}>
          <span className="map-detail-head">
            <b>{getClub(sel.id).name}</b>
            <span className={`ha${sel.away ? ' ha-a' : ''}`}>{sel.away ? 'AWAY' : 'HOME'}</span>
          </span>
          <span className="map-detail-sub">
            {sel.meta.city} · {sel.meta.league}
          </span>
          <span className="map-detail-sub">
            {sel.md} · {fmtMonthDay(kickoffDate(sel.f))} · 柏から <b className="num">{sel.km.toLocaleString()}km</b>
          </span>
        </button>
      ) : (
        <p className="note map-hint">
          柏から最も遠いのは<b>ニューカッスル（約7,700km）</b>、最も近いのは<b>浦項（約960km）</b>。
          塗られている国が対戦相手のいる国です。
        </p>
      )}
    </figure>
  );
};
