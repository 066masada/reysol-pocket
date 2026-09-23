import { useState } from 'react';
import type { ExternalLink } from '../../types';
import { useSettings, type ThemeMode } from '../../contexts/SettingsContext';
import { LINK_GROUPS, linksByGroup } from '../../data/links';
import { HOME_STADIUM } from '../../data/stadiums';
import { CHANGELOG } from '../../data/changelog';
import { useData } from '../../data/store';
import { openExternal } from '../../utils/external';
import { StadiumMap } from '../stadium/StadiumMap';
import { IconExternal } from '../ui/Icons';

const ICON_STYLE: Record<ExternalLink['group'], { bg: string; fg: string; text: string }> = {
  official: { bg: 'var(--sun)', fg: 'var(--night)', text: 'R' },
  ticket:   { bg: '#1B4F9C', fg: '#fff', text: 'T' },
  stream:   { bg: '#0C161C', fg: '#fff', text: '▶' },
  sns:      { bg: 'var(--paper-2)', fg: 'var(--ink)', text: '@' },
  board:    { bg: 'var(--night)', fg: 'var(--sun)', text: 'BBS' },
};

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: '端末に合わせる' },
  { id: 'light', label: 'ライト' },
  { id: 'dark', label: 'ダーク' },
];

export const MorePage = () => {
  const { theme, setTheme } = useSettings();
  const { updatedAt } = useData();
  const [showLog, setShowLog] = useState(false);

  return (
    <div className="page">
      <div className="page-title-row">
        <h1 className="page-title">もっと</h1>
        <span className="eyebrow">v{__APP_VERSION__}</span>
      </div>

      {LINK_GROUPS.map((g) => (
        <section key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <span className="eyebrow">{g.label}</span>
          <div className="card">
            {linksByGroup(g.id).map((l) => {
              const ic = ICON_STYLE[l.group];
              return (
                <button type="button" key={l.id} className="link-row" onClick={() => openExternal(l.url)}>
                  <span className="link-ico" style={{ background: ic.bg, color: ic.fg }}>{ic.text}</span>
                  <span className="lbl"><b>{l.label}</b>{l.description && <small>{l.description}</small>}</span>
                  <span className="arrow"><IconExternal /></span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <span className="eyebrow">Stadium guide</span>
        <StadiumMap stadium={HOME_STADIUM} />
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <span className="eyebrow">Settings</span>
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>テーマ</div>
            <div className="seg" role="radiogroup" aria-label="テーマ">
              {THEMES.map((t) => (
                <button type="button" key={t.id} role="radio" aria-checked={theme === t.id} className={theme === t.id ? 'active' : ''} onClick={() => setTheme(t.id)}>{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>ホーム画面に追加</div>
            <p className="note">
              iPhone: Safari の共有ボタン →「ホーム画面に追加」／ Android: Chrome のメニュー →「アプリをインストール」。
              追加すると全画面で起動し、外部リンクはアプリ内ブラウザで開きます。
            </p>
          </div>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <div className="sec-head">
          <span className="eyebrow">About</span>
          <button type="button" className="link" onClick={() => setShowLog(true)}>更新履歴 →</button>
        </div>
        <p className="note">
          Reysol Pocket は柏レイソルサポーターによる非公式のファンアプリです。
          日程・結果は柏レイソル公式サイト、順位表はJリーグ公式サイトから1日2回取り込んでいます。
          各リンク先の内容は各サイトに帰属します。
        </p>
        <p className="note">
          データ最終更新: {updatedAt
            ? `${new Date(updatedAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
            : 'アプリ同梱データ（オフラインまたは取得待ち）'}
        </p>
      </section>

      {showLog && (
        <div className="sheet-bg" onClick={() => setShowLog(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sec-head" style={{ marginBottom: 'var(--s-4)' }}>
              <h2 className="page-title">更新履歴</h2>
              <button type="button" onClick={() => setShowLog(false)} aria-label="閉じる" style={{ fontSize: 20, minWidth: 44, minHeight: 44 }}>✕</button>
            </div>
            {CHANGELOG.map((c) => (
              <div key={c.label} style={{ marginBottom: 'var(--s-4)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span className="num" style={{ fontWeight: 700 }}>{c.label}</span>
                  <span className="note">{c.date}</span>
                </div>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--ink-2)' }}>
                  {c.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
