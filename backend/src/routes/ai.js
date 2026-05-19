import { Router } from 'express';
import { config } from '../config.js';
import { improveComment, isOpenAiConfigured } from '../services/openai.js';

const router = Router();
const MODES = new Set(['formal', 'shorten', 'polite']);

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    configured: isOpenAiConfigured(),
    model: config.openaiModel,
  });
});

router.post('/improve-comment', async (req, res) => {
  if (!isOpenAiConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'AI не настроен: добавьте OPENAI_API_KEY в backend/.env',
    });
  }

  const comment = String(req.body.comment ?? '').trim();
  const mode = MODES.has(req.body.mode) ? req.body.mode : 'formal';

  if (comment.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Напишите черновик (минимум 3 символа).',
    });
  }

  if (comment.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Слишком длинный текст для AI (макс. 2000 символов).',
    });
  }

  try {
    const text = await improveComment(comment, mode);
    return res.json({ success: true, text, mode });
  } catch (error) {
    console.error('OpenAI improve error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Ошибка OpenAI API',
    });
  }
});

export default router;
