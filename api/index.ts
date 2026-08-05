import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type { IncomingMessage, ServerResponse } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let handler: ((req: IncomingMessage, res: ServerResponse) => Promise<void>) | null = null;

async function loadHandler() {
  const distHandlerPath = pathToFileURL(path.join(__dirname, '../dist/server.cjs')).href;
  const backendHandlerPath = pathToFileURL(path.join(__dirname, '../backend/server.ts')).href;

  try {
    const module = await import(distHandlerPath);
    return module?.default ?? module;
  } catch (distError) {
    const module = await import(backendHandlerPath);
    return module?.default ?? module;
  }
}

export default async function (req: IncomingMessage, res: ServerResponse) {
  try {
    if (!handler) {
      handler = await loadHandler();
    }
    await handler(req as any, res as any);
  } catch (err: any) {
    const message = err?.message || String(err) || 'unknown_error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'function_load_failed', message, stack: err?.stack }));
  }
}
