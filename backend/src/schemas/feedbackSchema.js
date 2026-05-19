import { z } from 'zod';

const PHONE_RE = /^[\d\s+().-]{7,20}$/;

export const feedbackSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Укажите имя (минимум 2 символа).')
    .max(100, 'Имя слишком длинное.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Укажите телефон.')
    .regex(PHONE_RE, 'Некорректный формат телефона.'),
  email: z.string().trim().min(1, 'Укажите email.').email('Некорректный email.'),
  comment: z
    .string()
    .trim()
    .min(3, 'Комментарий слишком короткий.')
    .max(5000, 'Комментарий слишком длинный.'),
});

function zodErrorsToFields(error) {
  const errors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function validateFeedback(body) {
  const result = feedbackSchema.safeParse(body);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  return { ok: false, errors: zodErrorsToFields(result.error) };
}
