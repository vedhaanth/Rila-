import { existsSync } from 'fs';
import path from 'path';

const serverPath = path.resolve('./dist/server.cjs');

if (!existsSync(serverPath)) {
  throw new Error(
    'Missing dist/server.cjs. Run `npm run build` before starting, or configure Render to run `npm run build` as the build command.'
  );
}

await import('./dist/server.cjs');
