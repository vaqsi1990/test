import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFromAddress } from './utils/parseFrom.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function normalizeEnv(value) {
  if (!value) return '';
  let normalized = String(value).trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  /** URL фронтенда для CORS: https://site.onrender.com */
  frontendUrl: normalizeEnv(process.env.FRONTEND_URL),
  ownerEmail: process.env.OWNER_EMAIL,
  mailFrom: normalizeEnv(process.env.MAIL_FROM),
  /** Имя отправителя в почтовом клиенте (если MAIL_FROM — только email) */
  mailFromName: normalizeEnv(process.env.MAIL_FROM_NAME) || 'Обратная связь',
  /** Заголовок писем и подпись в теле письма */
  siteName: normalizeEnv(process.env.SITE_NAME) || 'Обратная связь',
  brevoApiKey: normalizeEnv(process.env.BREVO_API_KEY),
  openaiApiKey: normalizeEnv(process.env.OPENAI_API_KEY),
  openaiModel: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
};

export function assertMailConfig() {
  requireEnv('OWNER_EMAIL');
  requireEnv('BREVO_API_KEY');

  if (!config.mailFrom) {
    throw new Error('Укажите MAIL_FROM в .env (email, подтверждённый в Brevo → Senders).');
  }

  const fromEmail = parseFromAddress(config.mailFrom).email.toLowerCase();
  if (fromEmail.includes('example.com')) {
    throw new Error('MAIL_FROM не может быть example.com.');
  }
}
