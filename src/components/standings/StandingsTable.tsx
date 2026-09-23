import type { StandingsTable as Table } from '../../types';
import { getClub, KASHIWA_ID } from '../../data/clubs';
import { openExternal } from '../../utils/external';
import { Crest } from '../match/Parts';
import { IconExternal } from '../ui/Icons';

/**
 * 順位表。柏の行をハイライトし、進出／降格ラインに区切りを引く。
 * 狭い画面では 勝/分/敗 を "6-0-2" にまとめる。
 */
export const StandingsTable = ({ table }: { table: Table }) => (
  <div className="card">
    <div className="std-head">
      <span className="eyebrow">{table.title} · {table.asOf}</span>
    </div>
    <div className="std-scroll">
      <table className="std-table">
        <thead>
          <tr>
            <th className="c-rank">#</th>
            <th className="c-club">クラブ</th>
            <th>試</th>
            <th className="c-wdl">勝-分-敗</th>
            <th className="c-w">勝</th><th className="c-w">分</th><th className="c-w">敗</th>
            <th>得</th><th>失</th><th>差</th>
            <th className="c-pts">点</th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => {
            const club = getClub(r.clubId);
            const me = r.clubId === KASHIWA_ID;
            const gd = r.gf - r.ga;
            const line =
              (table.qualifyRank && r.rank === table.qualifyRank) ? ' line-below' :
              (table.relegateRank && r.rank === table.relegateRank) ? ' line-above' : '';
            return (
              <tr key={r.clubId} className={`${me ? 'me' : ''}${line}`}>
                <td className="c-rank num">{r.rank}</td>
                <td className="c-club">
                  <span className="club-cell">
                    <Crest club={club} size="sm" />
                    <span className="club-name">{club.short}</span>
                  </span>
                </td>
                <td className="num">{r.played}</td>
                <td className="c-wdl num">{r.won}-{r.drawn}-{r.lost}</td>
                <td className="c-w num">{r.won}</td><td className="c-w num">{r.drawn}</td><td className="c-w num">{r.lost}</td>
                <td className="num">{r.gf}</td><td className="num">{r.ga}</td>
                <td className="num">{gd > 0 ? `+${gd}` : gd}</td>
                <td className="c-pts num">{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div className="std-foot">
      <span className="note">
        {table.qualifyRank ? `上位${table.qualifyRank}位までがノックアウトステージ進出。` : ''}
        {table.relegateRank ? `${table.relegateRank}位以下は降格圏。` : ''}
        更新: {table.updatedAt}
      </span>
      <button type="button" className="btn btn-line btn-sm" onClick={() => openExternal(table.sourceUrl)}>
        <IconExternal />公式順位表
      </button>
    </div>
  </div>
);
