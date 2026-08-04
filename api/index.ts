import path from 'path';
import { pathToFileURL } from 'url';
import type { IncomingMessage, ServerResponse } from 'http';

async function loadHandler() {
  const rootDistPath = path.resolve(process.cwd(), 'dist', 'server.cjs');
  try {
    const serverModule = await import(pathToFileURL(rootDistPath).href);
    return serverModule?.default || serverModule;
  } catch (primaryError) {
    const serverModule = await import('../dist/server.cjs');
    return serverModule?.default || serverModule;
  }
}

export default async function (req: IncomingMessage, res: ServerResponse) {
  try {
    const handler = await loadHandler();
    if (typeof handler !== 'function') {
      throw new Error('Server handler is not a function');
    }
    await handler(req as any, res as any);
  } catch (err: any) {
    const message = err?.message || String(err) || 'unknown_error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'function_load_failed', message, stack: err?.stack }));
  }
}
