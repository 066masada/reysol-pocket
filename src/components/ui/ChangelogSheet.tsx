import { CHANGELOG } from '../../data/changelog';

/** 更新履歴。ヘッダーのロゴ長押しで開く隠しコマンド */
export const ChangelogSheet = ({ onClose }: { onClose: () => void }) => (
  <div className="sheet-bg" onClick={onClose}>
    <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="更新履歴">
      <div className="sec-head" style={{ marginBottom: 'var(--s-4)' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 2 }}>developer menu</p>
          <h2 className="page-title">更新履歴</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="閉じる" style={{ fontSize: 20, minWidth: 44, minHeight: 44 }}>✕</button>
      </div>
      {CHANGELOG.map((c) => {
        const current = c.label === `v${__APP_VERSION__}`;
        return (
          <div key={c.label} style={{ marginBottom: 'var(--s-4)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span className="num" style={{ fontWeight: 700, color: current ? 'var(--sun-deep)' : 'var(--ink)' }}>{c.label}</span>
              {current && <span className="tk">現在</span>}
              <span className="note">{c.date}</span>
            </div>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
              {c.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        );
      })}
    </div>
  </div>
);
