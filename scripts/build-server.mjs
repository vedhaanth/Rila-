import { execFileSync } from 'node:child_process';
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

const esbuildEntry = path.join(root, 'node_modules', 'esbuild', 'bin', 'esbuild');
execFileSync(process.execPath, [esbuildEntry, 'backend/run-server.ts', '--bundle', '--platform=node', '--format=cjs', '--packages=external', '--sourcemap', '--outfile=server.cjs'], {
  cwd: root,
  stdio: 'inherit'
});
