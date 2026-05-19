import { config } from '../config.js';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function ownerNotificationEmail({ name, phone, email, comment, aiSummary }) {
  const site = config.siteName;
  const subject = `${site}: новая заявка от ${name}`;
  const summaryBlock = aiSummary
    ? ['', 'Краткое резюме (AI):', aiSummary]
    : [];

  const text = [
    `Новая заявка — ${site}`,
    '',
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Email: ${email}`,
    '',
    'Комментарий:',
    comment,
    ...summaryBlock,
  ].join('\n');

  const summaryHtml = aiSummary
    ? `<p><strong>Краткое резюме (AI):</strong> ${escapeHtml(aiSummary)}</p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="ru">
<body style="font-family:Arial,sans-serif;line-height:1.5;color:#1a1a2e">
    <h2>${escapeHtml(site)} — новая заявка</h2>
    <p><strong>Имя:</strong> ${escapeHtml(name)}</p>
    <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${summaryHtml}
    <p><strong>Комментарий:</strong></p>
    <p>${escapeHtml(comment).replace(/\n/g, '<br>')}</p>
</body>
</html>`;

  return { subject, text, html };
}

export function userCopyEmail({ name, phone, email, comment }) {
  const site = config.siteName;
  const subject = `${site}: копия вашего обращения`;
  const text = [
    `Здравствуйте, ${name}!`,
    '',
    `Мы получили ваше сообщение на сайте «${site}». Ниже копия отправленных данных:`,
    '',
    `Телефон: ${phone}`,
    `Email: ${email}`,
    '',
    'Комментарий:',
    comment,
    '',
    `С уважением, команда «${site}»`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="ru">
<body style="font-family:Arial,sans-serif;line-height:1.5;color:#1a1a2e">
    <p>Здравствуйте, <strong>${escapeHtml(name)}</strong>!</p>
    <p>Мы получили ваше сообщение на сайте «${escapeHtml(site)}». Ниже копия отправленных данных:</p>
    <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Комментарий:</strong></p>
    <p>${escapeHtml(comment).replace(/\n/g, '<br>')}</p>
    <p>С уважением,<br>команда «${escapeHtml(site)}»</p>
</body>
</html>`;

  return { subject, text, html };
}
