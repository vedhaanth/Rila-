import { existsSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const root = process.cwd();
const candidates = [
  path.resolve(root, 'server.cjs'),
  path.resolve(root, 'dist/server.cjs'),
  path.resolve(root, 'backend/server.js'),
  path.resolve(root, 'backend/server.ts')
];

const serverPath = candidates.find((candidate) => existsSync(candidate));

if (!serverPath) {
  throw new Error('Missing server entrypoint. Run npm run build first.');
}

if (serverPath.endsWith('.ts')) {
  const { startServer } = await import(pathToFileURL(serverPath).href);
  const app = (await import('express')).default();
  await startServer(app);
} else {
  await import(pathToFileURL(serverPath).href);
}
