import type { ExternalLink } from '../types';

export const LINKS: ExternalLink[] = [
  /* ── 公式 ── */
  { id: 'official',   group: 'official', label: '柏レイソル公式サイト', url: 'https://www.reysol.co.jp/', description: 'ニュース・選手・試合情報' },
  { id: 'news',       group: 'official', label: '公式ニュース',        url: 'https://www.reysol.co.jp/news/', description: '最新のお知らせ' },
  { id: 'schedule',   group: 'official', label: '公式 試合日程',       url: 'https://www.reysol.co.jp/game/results/', description: '日程・結果' },
  { id: 'stadium',    group: 'official', label: 'スタジアムガイド（公式）', url: 'https://www.reysol.co.jp/stadium/', description: 'アクセス・座席・注意事項' },
  { id: 'jleague',    group: 'official', label: 'Jリーグ公式 柏ページ', url: 'https://www.jleague.jp/club/kashiwa/', description: '順位・日程・選手一覧' },
  { id: 'jleague-live', group: 'official', label: 'Jリーグ公式 試合速報', url: 'https://www.jleague.jp/match/', description: '全会場のリアルタイム速報' },
  { id: 'sportsnavi',   group: 'official', label: 'スポーツナビ 柏レイソル', url: 'https://soccer.yahoo.co.jp/jleague/team/132', description: 'スタメン・スタッツ・日程' },
  { id: 'acl',        group: 'official', label: 'ACLE 特設ページ',     url: 'https://www.reysol.co.jp/acl/', description: 'AFCチャンピオンズリーグ Elite' },
  { id: 'fanclub',    group: 'official', label: 'ファンクラブ（アソシエイツ）', url: 'https://www.reysol.co.jp/fanclub/', description: '入会・特典' },
  { id: 'shop',       group: 'official', label: 'オフィシャルショップ', url: 'https://www.reysol.co.jp/goods/', description: 'グッズ' },

  /* ── チケット ── */
  { id: 'ticket',     group: 'ticket', label: 'チケット（公式）',     url: 'https://www.reysol.co.jp/ticket/', description: '席種・価格・購入方法' },
  { id: 'ticket-sch', group: 'ticket', label: '販売日程',            url: 'https://www.reysol.co.jp/ticket/tktscd.php', description: '先行・一般販売のスケジュール' },
  { id: 'jl-ticket',  group: 'ticket', label: 'Jリーグチケット',     url: 'https://www.jleague-ticket.jp/club/ka/', description: '柏レイソル主催試合の購入ページ' },

  /* ── 配信 ── */
  { id: 'dazn',       group: 'stream', label: 'DAZN',               url: 'https://www.dazn.com/ja-JP/home', description: 'J1・ルヴァン・ACLE' },
  { id: 'abema',      group: 'stream', label: 'ABEMA',              url: 'https://abema.tv/', description: 'ABEMA de DAZN／一部無料試合' },

  /* ── SNS ── */
  { id: 'x',          group: 'sns', label: 'X（旧Twitter）',          url: 'https://x.com/REYSOL_Official' },
  { id: 'instagram',  group: 'sns', label: 'Instagram',              url: 'https://www.instagram.com/kashiwareysol_official/' },
  { id: 'youtube',    group: 'sns', label: 'YouTube',                url: 'https://www.youtube.com/@kashiwareysol' },

  /* ── 掲示板 ── */
  { id: 'board',      group: 'board', label: '超柏レイソル掲示板',    url: 'https://bm.best-hit.tv/reysol/', description: '超サッカー掲示板' },
];

export const LINK_GROUPS: { id: ExternalLink['group']; label: string }[] = [
  { id: 'official', label: '公式' },
  { id: 'ticket',   label: 'チケット' },
  { id: 'stream',   label: '配信' },
  { id: 'sns',      label: 'SNS' },
  { id: 'board',    label: '掲示板' },
];

export const linksByGroup = (g: ExternalLink['group']) => LINKS.filter((l) => l.group === g);
