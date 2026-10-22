import fs from 'node:fs';
import path from 'node:path';
const dir = path.join(process.cwd(), 'data');
for (const f of fs.readdirSync(dir)) if (/^oche\.db/.test(f)) fs.rmSync(path.join(dir, f));
console.log('Databáza zmazaná. Pri ďalšom spustení sa znova naplní ukážkovými inzerátmi.');
