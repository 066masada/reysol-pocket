import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VISITS_KEY = 'reysol-pocket:visits';
const DISMISSED_KEY = 'reysol-pocket:installDismissed';
/** 2回目の訪問から案内する（初回はまずアプリを見てもらう） */
const MIN_VISITS = 2;
/** 閉じられたら30日は出さない */
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as { standalone?: boolean }).standalone === true;

export const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

interface Gate { ok: boolean; ios: boolean; visits: number }

const openGate = (): Gate => {
  const ios = isIos();
  if (isStandalone()) return { ok: false, ios, visits: 0 };
  const visits = Number(read(VISITS_KEY) ?? '0') + 1;
  const snoozedAt = Number(read(DISMISSED_KEY) ?? '0');
  const snoozed = snoozedAt > 0 && Date.now() - snoozedAt < SNOOZE_MS;
  return { ok: visits >= MIN_VISITS && !snoozed, ios, visits };
};

/**
 * ホーム画面への追加を案内する。
 * Android/Chrome は beforeinstallprompt をそのまま使い、iOS は手順を案内する。
 */
export const useInstallPrompt = () => {
  const [gate] = useState(openGate);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // 訪問回数の記録（外部ストレージへの書き込み）
  useEffect(() => {
    if (gate.visits > 0) write(VISITS_KEY, String(gate.visits));
  }, [gate.visits]);

  useEffect(() => {
    if (!gate.ok || gate.ios) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [gate.ok, gate.ios]);

  const install = useCallback(async () => {
    if (!deferred) return 'unsupported' as const;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === 'accepted') setInstalled(true);
    return outcome;
  }, [deferred]);

  const dismiss = useCallback(() => {
    write(DISMISSED_KEY, String(Date.now()));
    setDismissed(true);
  }, []);

  return {
    /** バナーを出してよいか（iOS は手順案内、それ以外はインストール可能になってから） */
    show: gate.ok && !dismissed && !installed && (gate.ios || deferred !== null),
    /** ネイティブのインストールダイアログが使えるか */
    canPrompt: deferred !== null,
    ios: gate.ios,
    install,
    dismiss,
  };
};
