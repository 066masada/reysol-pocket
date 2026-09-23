import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

interface Settings {
  theme: ThemeMode;
}

interface SettingsContextType extends Settings {
  setTheme: (t: ThemeMode) => void;
}

const KEY = 'reysol-pocket:settings';

const load = (): Settings => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { theme: 'system', ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { theme: 'system' };
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
    const root = document.documentElement;
    if (settings.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', settings.theme);
  }, [settings]);

  const value = useMemo(() => ({
    ...settings,
    setTheme: (theme: ThemeMode) => setSettings((s) => ({ ...s, theme })),
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
