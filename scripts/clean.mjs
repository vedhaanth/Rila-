import { rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

for (const target of ['dist', 'server.cjs', 'server.cjs.map']) {
  const full = path.join(root, target);
  if (existsSync(full)) {
    rmSync(full, { recursive: true, force: true });
  }
}
