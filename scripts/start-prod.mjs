import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const serverFile = path.join(root, 'server.cjs');

if (!existsSync(serverFile)) {
  throw new Error('server.cjs not found. Build step must generate it before start.');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
await import(pathToFileURL(serverFile).href);
