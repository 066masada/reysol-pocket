import type { Fixture } from '../types';

/**
 * 柏レイソル 2026/27 シーズン 試合日程
 * 出典: 柏レイソル公式サイト 試合日程 https://www.reysol.co.jp/game/results/ （2026-09-22 取得）
 *       チケット販売日程 https://www.reysol.co.jp/ticket/tktscd.php
 *
 * - 2027年開催分の詳細は 12 月上旬に発表予定（時刻未定・日付は「or」表記）
 * - ACLE ホームの会場名は AFC 規定により「柏サッカースタジアム」（三協フロンテア柏スタジアムと同一）
 */

export const SEASON = '2026-27';

const TICKET_HOME = 'https://www.reysol.co.jp/ticket/';

/**
 * 販売スケジュール。出典: 柏レイソル公式「販売日程」https://www.reysol.co.jp/ticket/tktscd.php
 * アソシエイツ（ファンクラブ）会員先行は試合前日まで受付のため、個別の日付は持たない。
 */
const sales = (lottery: string, first: string, second: string, third: string) => [
  { type: 'lottery' as const, at: lottery },
  { type: 'first'   as const, at: first },
  { type: 'second'  as const, at: second },
  { type: 'third'   as const, at: third },
];

const TICKET_JL = 'https://www.jleague-ticket.jp/club/ka/';

/** スポーツナビの試合ページ（スタメン・スタッツ）。ID は試合ごとに発行される */
const sn = (id: string) => `https://soccer.yahoo.co.jp/jleague/game/${id}`;

const K = 'kashiwa';

/** 日程未確定の試合用ヘルパー（時刻未定） */
const tbd = (
  id: string, competition: Fixture['competition'], round: string,
  date: string, dateLabel: string, home: string, away: string, stadiumId?: string, note?: string,
): Fixture => ({
  id, competition, round, kickoffAt: date, dateLabel, timeTBD: true, home, away, stadiumId, status: 'scheduled', note,
  ticketUrl: home === K ? TICKET_HOME : undefined,
});

export const FIXTURES: Fixture[] = [
  /* ── プレシーズン ── */
  {
    id: '2026-08-01-psm', competition: 'preseason', round: '第31回 ちばぎんカップ',
    kickoffAt: '2026-08-01T19:00:00+09:00', home: 'chiba', away: K, stadiumId: 'fukuari',
    status: 'ft', score: { home: 0, away: 0, note: 'PK 4-5 で柏が優勝' },
  },

  /* ── 8月 ── */
  { id: '2026-08-08-j1-01', competition: 'j1', round: '第1節', kickoffAt: '2026-08-08T19:00:00+09:00', home: K, away: 'mito',     stadiumId: 'sankyo',    status: 'ft', score: { home: 2, away: 1 } },
  { id: '2026-08-14-j1-02', competition: 'j1', round: '第2節', kickoffAt: '2026-08-14T19:00:00+09:00', home: 'verdy', away: K,   stadiumId: 'kokuritsu', status: 'ft', score: { home: 1, away: 3 } },
  { id: '2026-08-21-j1-03', competition: 'j1', round: '第3節', kickoffAt: '2026-08-21T19:00:00+09:00', home: K, away: 'nagasaki', stadiumId: 'sankyo',    status: 'ft', score: { home: 4, away: 2 } },
  { id: '2026-08-26-emp-r2', competition: 'emperor', round: '2回戦', kickoffAt: '2026-08-26T19:00:00+09:00', home: K, away: 'senshu', stadiumId: 'sankyo', status: 'ft', score: { home: 2, away: 1 } },
  { id: '2026-08-29-j1-04', competition: 'j1', round: '第4節', kickoffAt: '2026-08-29T18:30:00+09:00', home: 'shimizu', away: K, stadiumId: 'iai',       status: 'ft', score: { home: 0, away: 1 } },

  /* ── 9月 ── */
  { id: '2026-09-02-j1-05', competition: 'j1', round: '第5節', kickoffAt: '2026-09-02T19:00:00+09:00', home: 'cerezo', away: K,  stadiumId: 'yanmar',    status: 'ft', score: { home: 2, away: 0}, lineupUrl: sn('2026090222') },
  { id: '2026-09-06-j1-06', competition: 'j1', round: '第6節', kickoffAt: '2026-09-06T19:00:00+09:00', home: K, away: 'yokohamafm', stadiumId: 'sankyo', status: 'ft', score: { home: 0, away: 2}, lineupUrl: sn('2026090607') },
  { id: '2026-09-11-j1-07', competition: 'j1', round: '第7節', kickoffAt: '2026-09-11T19:00:00+09:00', home: 'kyoto', away: K,   stadiumId: 'sanga',     status: 'ft', score: { home: 2, away: 3}, lineupUrl: sn('2026091101') },
  { id: '2026-09-16-acle-md1', competition: 'acle', round: 'LS-MD1', kickoffAt: '2026-09-16T19:00:00+09:00', home: 'jeonbuk', away: K, stadiumId: 'jeonju', status: 'ft', score: { home: 2, away: 1}, lineupUrl: sn('2026091603'), note: '現地19:00／日本19:00' },
  { id: '2026-09-20-j1-08', competition: 'j1', round: '第8節', kickoffAt: '2026-09-20T17:00:00+09:00', home: 'machida', away: K, stadiumId: 'machida',   status: 'ft', score: { home: 2, away: 4}, lineupUrl: sn('2026092001') },
  {
    id: '2026-09-23-emp-r3', competition: 'emperor', round: '3回戦',
    kickoffAt: '2026-09-23T17:00:00+09:00', home: K, away: 'imabari', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME, lineupUrl: sn('2026092320'),
  },

  /* ── 10月 ── */
  {
    id: '2026-10-03-lc-r4', competition: 'levain', round: '1stラウンド 4回戦',
    kickoffAt: '2026-10-03T19:00:00+09:00', home: K, away: 'gamba', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME,
    ticketSales: sales('2026-09-12T12:00:00+09:00', '2026-09-15T18:00:00+09:00', '2026-09-17T18:00:00+09:00', '2026-09-19T12:00:00+09:00'),
  },
  {
    id: '2026-10-09-j1-09', competition: 'j1', round: '第9節',
    kickoffAt: '2026-10-09T19:00:00+09:00', home: K, away: 'kobe', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME,
    ticketSales: sales('2026-09-19T12:00:00+09:00', '2026-09-22T12:00:00+09:00', '2026-09-24T18:00:00+09:00', '2026-09-26T12:00:00+09:00'),
  },
  {
    id: '2026-10-14-acle-md2', competition: 'acle', round: 'LS-MD2',
    kickoffAt: '2026-10-14T19:00:00+09:00', home: K, away: 'port', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME,
    ticketSales: sales('2026-09-27T12:00:00+09:00', '2026-09-29T18:00:00+09:00', '2026-10-01T18:00:00+09:00', '2026-10-04T12:00:00+09:00'),
  },
  {
    id: '2026-10-17-j1-10', competition: 'j1', round: '第10節',
    kickoffAt: '2026-10-17T19:00:00+09:00', home: K, away: 'nagoya', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME,
    ticketSales: sales('2026-09-26T12:00:00+09:00', '2026-09-29T18:00:00+09:00', '2026-10-01T18:00:00+09:00', '2026-10-04T12:00:00+09:00'),
  },
  { id: '2026-10-21-j1-11', competition: 'j1', round: '第11節', kickoffAt: '2026-10-21T19:00:00+09:00', home: 'fctokyo', away: K, stadiumId: 'ajinomoto', status: 'scheduled' },
  { id: '2026-10-24-j1-12', competition: 'j1', round: '第12節', kickoffAt: '2026-10-24T15:00:00+09:00', home: 'kashima', away: K, stadiumId: 'kashima',   status: 'scheduled' },
  { id: '2026-10-27-acle-md3', competition: 'acle', round: 'LS-MD3', kickoffAt: '2026-10-27T21:15:00+09:00', home: 'ratchaburi', away: K, stadiumId: 'ratchaburi', status: 'scheduled', note: '現地19:15／日本21:15' },
  {
    id: '2026-10-31-j1-13', competition: 'j1', round: '第13節',
    kickoffAt: '2026-10-31T16:00:00+09:00', home: K, away: 'urawa', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME,
    ticketSales: sales('2026-10-10T12:00:00+09:00', '2026-10-13T18:00:00+09:00', '2026-10-15T18:00:00+09:00', '2026-10-18T12:00:00+09:00'),
  },

  /* ── 11月 ── */
  {
    id: '2026-11-03-acle-md4', competition: 'acle', round: 'LS-MD4',
    kickoffAt: '2026-11-03T19:00:00+09:00', home: K, away: 'daejeon', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME,
    ticketSales: sales('2026-10-11T12:00:00+09:00', '2026-10-13T18:00:00+09:00', '2026-10-15T18:00:00+09:00', '2026-10-18T12:00:00+09:00'),
  },
  { id: '2026-11-07-j1-14', competition: 'j1', round: '第14節', kickoffAt: '2026-11-07T16:00:00+09:00', home: K, away: 'kawasaki', stadiumId: 'sankyo', status: 'scheduled', ticketUrl: TICKET_HOME },
  { id: '2026-11-20-j1-15', competition: 'j1', round: '第15節', kickoffAt: '2026-11-20T19:00:00+09:00', home: K, away: 'chiba',    stadiumId: 'sankyo', status: 'scheduled', ticketUrl: TICKET_HOME },
  { id: '2026-11-24-acle-md5', competition: 'acle', round: 'LS-MD5', kickoffAt: '2026-11-24T16:45:00+09:00', home: 'newcastle', away: K, stadiumId: 'centralcoast', status: 'scheduled', note: '現地18:45／日本16:45' },
  { id: '2026-11-28-j1-17', competition: 'j1', round: '第17節', kickoffAt: '2026-11-28T16:00:00+09:00', home: K, away: 'hiroshima', stadiumId: 'sankyo', status: 'scheduled', ticketUrl: TICKET_HOME },

  /* ── 12月 ── */
  {
    id: '2026-12-01-acle-md6', competition: 'acle', round: 'LS-MD6',
    kickoffAt: '2026-12-01T19:00:00+09:00', home: K, away: 'conganhanoi', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME,
    ticketSales: sales('2026-11-08T12:00:00+09:00', '2026-11-10T18:00:00+09:00', '2026-11-12T18:00:00+09:00', '2026-11-14T12:00:00+09:00'),
  },
  { id: '2026-12-06-j1-18', competition: 'j1', round: '第18節', kickoffAt: '2026-12-06T16:00:00+09:00', home: K, away: 'fukuoka',  stadiumId: 'sankyo',   status: 'scheduled', ticketUrl: TICKET_HOME },
  { id: '2026-12-13-j1-19', competition: 'j1', round: '第19節', kickoffAt: '2026-12-13T14:00:00+09:00', home: 'okayama', away: K,  stadiumId: 'jfe',      status: 'scheduled' },
  { id: '2026-12-16-j1-16', competition: 'j1', round: '第16節', kickoffAt: '2026-12-16T19:00:00+09:00', home: 'gamba', away: K,    stadiumId: 'panasonic', status: 'scheduled' },
  { id: '2026-12-19-j1-20', competition: 'j1', round: '第20節', kickoffAt: '2026-12-19T16:00:00+09:00', home: 'kawasaki', away: K, stadiumId: 'todoroki', status: 'scheduled' },

  /* ── 2027年（ウインターブレイク明け。詳細は12月上旬発表予定） ── */
  {
    id: '2027-02-10-acle-md7', competition: 'acle', round: 'LS-MD7',
    kickoffAt: '2027-02-10T19:00:00+09:00', home: K, away: 'buriram', stadiumId: 'sankyo', status: 'scheduled',
    ticketUrl: TICKET_HOME,
    ticketSales: sales('2027-01-16T12:00:00+09:00', '2027-01-19T18:00:00+09:00', '2027-01-21T18:00:00+09:00', '2027-01-23T12:00:00+09:00'),
  },
  tbd('2027-02-13-j1-21', 'j1', '第21節', '2027-02-13', '2/13 or 14 (土or日)', K, 'shimizu', 'sankyo'),
  { id: '2027-02-16-acle-md8', competition: 'acle', round: 'LS-MD8', kickoffAt: '2027-02-16T19:00:00+09:00', home: 'pohang', away: K, stadiumId: 'pohang', status: 'scheduled', note: '現地19:00／日本19:00' },
  tbd('2027-02-20-j1-22', 'j1', '第22節', '2027-02-20', '2/20 or 21 (土or日)', 'mito', K, 'mito'),
  tbd('2027-02-27-j1-23', 'j1', '第23節', '2027-02-27', '2/27 or 28 (土or日)', 'nagasaki', K, 'peace'),
  tbd('2027-03-06-j1-24', 'j1', '第24節', '2027-03-06', '3/6 or 7 (土or日)', 'fukuoka', K, 'best'),
  tbd('2027-03-10-j1-25', 'j1', '第25節', '2027-03-10', '3/10 (水)', K, 'kyoto', 'sankyo', '2/24(水)に開催する可能性あり'),
  tbd('2027-03-13-j1-26', 'j1', '第26節', '2027-03-13', '3/13 or 14 (土or日)', K, 'okayama', 'sankyo', '3/3(水)もしくは4/7(水)に開催する可能性あり'),
  tbd('2027-03-20-j1-27', 'j1', '第27節', '2027-03-20', '3/20 or 21 (土or日・祝)', K, 'verdy', 'sankyo'),
  tbd('2027-04-03-j1-28', 'j1', '第28節', '2027-04-03', '4/3 or 4 (土or日)', K, 'cerezo', 'sankyo'),
  tbd('2027-04-10-j1-29', 'j1', '第29節', '2027-04-10', '4/10 or 11 (土or日)', 'urawa', K, 'saitama'),
  tbd('2027-04-17-j1-30', 'j1', '第30節', '2027-04-17', '4/17 or 18 (土or日)', 'yokohamafm', K, 'nissan'),
  tbd('2027-04-24-j1-31', 'j1', '第31節', '2027-04-24', '4/24 or 25 (土or日)', K, 'gamba', 'sankyo', '柏またはG大阪がACLE準々決勝進出の場合は4/1(木)もしくは4/7(水)に開催する可能性あり'),
  tbd('2027-04-29-j1-32', 'j1', '第32節', '2027-04-29', '4/29 (木・祝)', K, 'fctokyo', 'sankyo', '柏がACLE準々決勝進出の場合は5/19(水)に開催する可能性あり'),
  tbd('2027-05-03-j1-33', 'j1', '第33節', '2027-05-03', '5/3 or 4 (月・祝or火・祝)', 'kobe', K, 'noevir', '柏または神戸がACLE準々決勝進出の場合は5/5(水・祝)もしくは5/26(水)に開催する可能性あり'),
  tbd('2027-05-09-j1-34', 'j1', '第34節', '2027-05-09', '5/9 (日)', K, 'machida', 'sankyo', 'ルヴァンカップ決勝進出クラブの試合は4/21・5/12・5/19・6/2(水)のいずれかに開催する可能性あり'),
  tbd('2027-05-15-j1-35', 'j1', '第35節', '2027-05-15', '5/15 or 16 (土or日)', 'nagoya', K, undefined, '会場未定'),
  tbd('2027-05-22-j1-36', 'j1', '第36節', '2027-05-22', '5/22 or 23 (土or日)', 'hiroshima', K, 'edion'),
  tbd('2027-05-29-j1-37', 'j1', '第37節', '2027-05-29', '5/29 or 30 (土or日)', K, 'kashima', 'sankyo'),
  tbd('2027-06-06-j1-38', 'j1', '第38節', '2027-06-06', '6/6 (日)', 'chiba', K, 'fukuari'),
];

export const TICKET_LINKS = { official: TICKET_HOME, jleague: TICKET_JL };
