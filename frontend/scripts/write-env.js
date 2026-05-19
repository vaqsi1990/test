import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiBase = (
  process.env.PUBLIC_API_URL || 'https://test-44z5.onrender.com'
).trim().replace(/\/$/, '');

if (!apiBase) {
  console.warn(
    'PUBLIC_API_URL не задан — в env.js будет пустой API_BASE (подходит только для npm run dev).',
  );
}

const content = `/** Сгенерировано scripts/write-env.js */\nexport const API_BASE = ${JSON.stringify(apiBase)};\n`;

fs.writeFileSync(path.join(root, 'js', 'env.js'), content, 'utf8');
console.log('env.js → API_BASE =', apiBase || '(пусто)');
