import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';

// Route imports — add new routers here
// import { formsRouter } from './api/forms';
// import { librariesRouter } from './api/libraries';
// import { authRouter } from './api/auth';
// import { submissionsRouter } from './api/submissions';
// import { mondayRouter } from './api/monday';

export function createApp() {
  const app = express();

  // ── Security & Parsing ──────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(pino({ logger: undefined }));

  // ── Health check (public) ───────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API v1 Routes ───────────────────────────────────────────────────────────
  // app.use('/api/v1/auth',        authRouter);
  // app.use('/api/v1/forms',       formsRouter);
  // app.use('/api/v1/libraries',   librariesRouter);
  // app.use('/api/v1/monday',      mondayRouter);

  // ── Error Handling ──────────────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Start server if run directly
if (require.main === module) {
  const app = createApp();
  const port = parseInt(process.env.PORT || '3001', 10);
  app.listen(port, () => {
    console.log(`FieldSaver API running on port ${port}`);
  });
}
