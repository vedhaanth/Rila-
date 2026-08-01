import type { IncomingMessage, ServerResponse } from 'http';

export default async function (req: IncomingMessage, res: ServerResponse) {
  try {
    const { default: handler } = await import('../backend/server');
    await handler(req as any, res as any);
  } catch (err: any) {
    const message = err?.message || String(err) || 'unknown_error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'function_import_failed', message }));
  }
}
