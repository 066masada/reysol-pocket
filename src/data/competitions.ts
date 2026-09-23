import type { Broadcast, BroadcastId, Competition, CompetitionId } from '../types';

export const BROADCASTS: Record<BroadcastId, Broadcast> = {
  dazn:  { id: 'dazn',  name: 'DAZN',    url: 'https://www.dazn.com/ja-JP/home' },
  abema: { id: 'abema', name: 'ABEMA',   url: 'https://abema.tv/' },
};

export const COMPETITIONS: Record<CompetitionId, Competition> = {
  j1: {
    id: 'j1', name: '明治安田J1リーグ', short: 'J1',
    color: '#111111', textOnColor: '#FFE100',
    broadcast: ['dazn', 'abema'],
  },
  levain: {
    id: 'levain', name: 'JリーグYBCルヴァンカップ', short: 'ルヴァン',
    color: '#0F7A4A', textOnColor: '#FFFFFF',
    broadcast: ['dazn'],
  },
  emperor: {
    id: 'emperor', name: '天皇杯 JFA 第106回全日本サッカー選手権大会', short: '天皇杯',
    color: '#5C2D91', textOnColor: '#FFFFFF',
    broadcast: [],
  },
  acle: {
    id: 'acle', name: 'AFCチャンピオンズリーグ Elite 2026/27', short: 'ACLE',
    color: '#1B4F9C', textOnColor: '#FFFFFF',
    broadcast: ['dazn'],
  },
  preseason: {
    id: 'preseason', name: 'プレシーズンマッチ', short: 'PSM',
    color: '#807F78', textOnColor: '#FFFFFF',
    broadcast: [],
  },
};

export const COMPETITION_ORDER: CompetitionId[] = ['j1', 'levain', 'emperor', 'acle', 'preseason'];
