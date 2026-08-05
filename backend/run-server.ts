import express from 'express';
import { startServer } from './server.ts';

startServer(express()).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
