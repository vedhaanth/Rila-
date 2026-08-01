import type { IncomingMessage, ServerResponse } from 'http';
import handler from '../backend/server';

export default async function (req: IncomingMessage, res: ServerResponse) {
  await handler(req as any, res as any);
}
