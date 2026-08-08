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

// Keep native addons and large platform-specific packages external.
// Pure-JS packages like bcryptjs must be bundled so they are available
// on Render at runtime without relying on node_modules being present.
const externalPackages = [
  'express',
  'cors',
  'mongoose',
  'dotenv',
  'vite',
  'esbuild',
  'recharts',
  'react',
  'react-dom',
  'lucide-react',
  'motion',
  '@google/genai'
];

esbuild.buildSync({
  entryPoints: ['backend/run-server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  external: externalPackages,
  sourcemap: true,
  outfile: 'server.cjs',
  absWorkingDir: root
});

