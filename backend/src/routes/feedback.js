import { Router } from 'express';
import { config } from '../config.js';
import { sendFeedbackEmails } from '../services/mail.js';
import { summarizeComment } from '../services/openai.js';
import { validateFeedback } from '../schemas/feedbackSchema.js';

const router = Router();

router.post('/', async (req, res) => {
  const validation = validateFeedback(req.body);

  if (!validation.ok) {
    return res.status(400).json({
      success: false,
      message: 'Проверьте правильность заполнения полей.',
      errors: validation.errors,
    });
  }

  try {
    let aiSummary = null;

    if (config.openaiApiKey) {
      try {
        aiSummary = await summarizeComment(validation.data.comment);
      } catch (error) {
        console.warn('AI summary skipped:', error.message);
      }
    }

    const sendResult = await sendFeedbackEmails({
      ...validation.data,
      aiSummary,
    });

    return res.status(200).json({
      success: true,
      message: 'Сообщение отправлено. Копия письма отправлена на ваш email.',
      sentTo: {
        owner: sendResult.ownerEmail,
        user: sendResult.userEmail,
      },
    });
  } catch (error) {
    console.error('Feedback mail error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Не удалось отправить сообщение. Попробуйте позже.',
    });
  }
});

export default router;
