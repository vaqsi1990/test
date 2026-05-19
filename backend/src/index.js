import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { assertMailConfig, config } from './config.js';
import aiRouter from './routes/ai.js';
import feedbackRouter from './routes/feedback.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendPath = path.resolve(__dirname, '../../frontend');
try {
  assertMailConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true }));
app.use(express.json({ limit: '32kb' }));

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

app.use(express.static(frontendPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(config.port, () => {
  console.log(`http://localhost:${config.port}`);
});
