import { useEffect } from 'react';
import { useNavigation, type Screen } from '../contexts/NavigationContext';
import { trackPageView } from '../utils/analytics';

const SCREEN_LABELS: Record<Screen, string> = {
  home: 'ホーム',
  schedule: '日程',
  live: 'LIVE',
  boards: '掲示板',
  more: 'もっと',
};

/** 画面（タブ・サブビュー・試合詳細）の切り替わりを GA に送る。 */
export const usePageTracking = () => {
  const { screen, view, matchId } = useNavigation();

  useEffect(() => {
    if (matchId) {
      trackPageView(`/match/${encodeURIComponent(matchId)}`, `試合詳細 ${matchId}`);
      return;
    }
    if (view === 'acle') {
      trackPageView('/live/acle', 'ACL特設');
      return;
    }
    const path = `/${screen}${view ? `/${view}` : ''}`;
    const label = view === 'standings' ? '順位表' : SCREEN_LABELS[screen];
    trackPageView(path, label);
  }, [screen, view, matchId]);
};
