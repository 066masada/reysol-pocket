import { useState } from 'react';
import { NavigationProvider, useNavigation, type Screen } from './contexts/NavigationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { HomePage } from './components/pages/HomePage';
import { SchedulePage } from './components/pages/SchedulePage';
import { LivePage } from './components/pages/LivePage';
import { BoardsPage } from './components/pages/BoardsPage';
import { MorePage } from './components/pages/MorePage';
import { MatchDetailPage } from './components/pages/MatchDetailPage';
import { AclePage } from './components/pages/AclePage';
import { IconBoard, IconCalendar, IconHome, IconLive, IconMore } from './components/ui/Icons';
import { SEASON } from './data/schedule';
import { useRemoteData } from './hooks/useRemoteData';
import { useLiveScore } from './hooks/useLiveScore';
import { useSwipeTabs } from './hooks/useSwipeTabs';
import { useLongPress } from './hooks/useLongPress';
import { ChangelogSheet } from './components/ui/ChangelogSheet';
import './index.css';

const NAV_TABS: { id: Screen; label: string; Icon: () => React.JSX.Element }[] = [
  { id: 'home',     label: 'ホーム', Icon: IconHome },
  { id: 'schedule', label: '日程',   Icon: IconCalendar },
  { id: 'live',     label: 'LIVE',   Icon: IconLive },
  { id: 'boards',   label: '掲示板', Icon: IconBoard },
  { id: 'more',     label: 'もっと', Icon: IconMore },
];

const TAB_ORDER = NAV_TABS.map((t) => t.id);

const AppContent = () => {
  const { screen, view, matchId, navigate } = useNavigation();
  const [showLog, setShowLog] = useState(false);
  useRemoteData();
  useLiveScore();

  // 全画面の上に何か出ているときはスワイプ切替を止める
  const overlayOpen = Boolean(matchId) || view === 'acle' || showLog;
  useSwipeTabs(TAB_ORDER, screen, navigate, !overlayOpen);

  const longPress = useLongPress(() => setShowLog(true));

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand" {...longPress} style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
            <span className="brand-mark" aria-hidden>R</span>REYSOL POCKET
          </div>
          <span className="brand-sub">{SEASON}</span>
        </div>
      </header>

      <main className="app-main">
        <div className="tab-view" key={screen}>
          {screen === 'home'     && <HomePage />}
          {screen === 'schedule' && <SchedulePage />}
          {screen === 'live'     && <LivePage />}
          {screen === 'boards'   && <BoardsPage />}
          {screen === 'more'     && <MorePage />}
        </div>
      </main>

      {showLog && <ChangelogSheet onClose={() => setShowLog(false)} />}

      {view === 'acle' && !matchId && <AclePage />}
      {matchId && <MatchDetailPage id={matchId} />}

      <nav className="bottom-nav" aria-label="メインナビゲーション">
        <div className="bottom-nav-inner">
          {NAV_TABS.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              className={`nav-tab${screen === id ? ' active' : ''}`}
              aria-current={screen === id ? 'page' : undefined}
              onClick={() => navigate(id)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </SettingsProvider>
  );
}
