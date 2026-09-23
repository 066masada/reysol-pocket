/** data/*.json と同梱データのマージ結果を確認する（開発用） */
import { readFile } from 'node:fs/promises';

const fixtures = JSON.parse(await readFile('data/fixtures.json', 'utf8'));
const standings = JSON.parse(await readFile('data/standings-j1.json', 'utf8'));
const src = await readFile('src/data/schedule.ts', 'utf8');

const bundledRounds = [...src.matchAll(/round: '([^']+)'/g)].map((m) => m[1]);
const remoteRounds = fixtures.fixtures.map((f) => f.round);
const missing = bundledRounds.filter((r) => !remoteRounds.includes(r));
const added = remoteRounds.filter((r) => !bundledRounds.includes(r));

console.log(`同梱 ${bundledRounds.length}件 / 取得 ${remoteRounds.length}件`);
console.log('同梱にあって取得にない:', missing.length ? missing : 'なし');
console.log('取得にあって同梱にない:', added.length ? added : 'なし');
console.log(`順位表: ${standings.table.length}クラブ / ${standings.asOf}`);
const ksw = standings.table.find((r) => r.name.includes('柏'));
console.log('柏:', ksw);
