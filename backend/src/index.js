import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { assertMailConfig, config } from './config.js';
import aiRouter from './routes/ai.js';
import feedbackRouter from './routes/feedback.js';

try {
  assertMailConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function getCorsOptions() {
  if (!config.frontendUrl) {
    return { origin: true };
  }

  const allowed = config.frontendUrl
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
  };
}

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(
  '/api/feedback',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Слишком много запросов. Попробуйте позже.',
    },
  }),
  feedbackRouter,
);

app.use(
  '/api/ai',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
      success: false,
      message: 'Слишком много AI-запросов. Подождите.',
    },
  }),
  aiRouter,
);

app.listen(config.port, () => {
  console.log(`http://localhost:${config.port}`);
});
