import { existsSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const candidates = [path.resolve('./server.cjs'), path.resolve('./dist/server.cjs')];
const serverPath = candidates.find((candidate) => existsSync(candidate)) || path.resolve('./server.cjs');

if (!existsSync(serverPath)) {
  throw new Error(
    'Missing server entrypoint. Run `npm run build` before starting, or let the start script build it automatically.'
  );
}

await import(pathToFileURL(serverPath).href);
