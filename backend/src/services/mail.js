import { config } from '../config.js';
import { ownerNotificationEmail, userCopyEmail } from '../templates/emails.js';
import { parseFromAddress } from '../utils/parseFrom.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function getSender() {
  return parseFromAddress(config.mailFrom, config.mailFromName);
}

async function sendEmail({ to, subject, text, html, replyTo }) {
  const sender = getSender();
  const payload = {
    sender,
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text,
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': config.brevoApiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.message || body.error || JSON.stringify(body);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
}

export async function sendFeedbackEmails(data) {
  const ownerMail = ownerNotificationEmail(data);
  const userMail = userCopyEmail(data);

  await sendEmail({
    to: config.ownerEmail,
    replyTo: data.email,
    ...ownerMail,
  });

  await sendEmail({
    to: data.email,
    ...userMail,
  });

  return {
    ownerEmail: config.ownerEmail,
    userEmail: data.email,
  };
}
