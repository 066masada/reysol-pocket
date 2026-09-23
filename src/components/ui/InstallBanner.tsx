import { useState } from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

/**
 * ホーム画面への追加をすすめる帯。
 * Android はその場でインストール、iOS は共有シートの手順を開く。
 */
export const InstallBanner = () => {
  const { show, canPrompt, ios, install, dismiss } = useInstallPrompt();
  const [howTo, setHowTo] = useState(false);

  if (!show) return null;

  return (
    <>
      <section className="install" aria-label="ホーム画面に追加">
        <span className="install-icon" aria-hidden>
          <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M12 8v7M9 12l3 3 3-3" /></svg>
        </span>
        <div className="install-text">
          <b>ホーム画面に追加</b>
          <small>全画面で開いて、圏外でも日程が見られます</small>
        </div>
        <button type="button" className="btn btn-sun btn-sm" onClick={() => (canPrompt ? install() : setHowTo(true))}>
          追加
        </button>
        <button type="button" className="install-close" onClick={dismiss} aria-label="閉じる">✕</button>
      </section>

      {howTo && (
        <div className="sheet-bg" onClick={() => setHowTo(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sec-head" style={{ marginBottom: 'var(--s-4)' }}>
              <h2 className="page-title">ホーム画面に追加</h2>
              <button type="button" onClick={() => setHowTo(false)} aria-label="閉じる" style={{ fontSize: 20, minWidth: 44, minHeight: 44 }}>✕</button>
            </div>
            <ol className="howto">
              {ios ? (
                <>
                  <li>画面下の <b>共有ボタン</b>（□に↑）をタップ</li>
                  <li>メニューを下にスクロールして <b>「ホーム画面に追加」</b></li>
                  <li>右上の <b>「追加」</b> をタップ</li>
                </>
              ) : (
                <>
                  <li>ブラウザ右上の <b>メニュー（⋮）</b> をタップ</li>
                  <li><b>「アプリをインストール」</b>または<b>「ホーム画面に追加」</b></li>
                  <li><b>「インストール」</b> をタップ</li>
                </>
              )}
            </ol>
            <p className="note">追加すると全画面で起動し、掲示板などの外部リンクはアプリ内ブラウザで開きます（閉じれば元の画面に戻ります）。</p>
          </div>
        </div>
      )}
    </>
  );
};
