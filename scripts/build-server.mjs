import * as esbuild from 'esbuild';
import { rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const out = path.join(root, 'server.cjs');
if (existsSync(out)) {
  rmSync(out, { force: true });
}
const mapOut = path.join(root, 'server.cjs.map');
if (existsSync(mapOut)) {
  rmSync(mapOut, { force: true });
}

esbuild.buildSync({
  entryPoints: ['backend/run-server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: 'server.cjs',
  absWorkingDir: root
});
