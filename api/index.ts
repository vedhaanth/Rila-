import * as server from '../backend/server.ts';
import type { IncomingMessage, ServerResponse } from 'http';

const handler = (server as any).default ?? (server as any);

export default async function (req: IncomingMessage, res: ServerResponse) {
  try {
    await handler(req as any, res as any);
  } catch (err: any) {
    const message = err?.message || String(err) || 'unknown_error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'function_load_failed', message, stack: err?.stack }));
  }
}
