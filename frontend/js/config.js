import { API_BASE } from './env.js';

const DEV_API_PORT = 3000;

const needsLocalApi =
  !API_BASE &&
  window.location.hostname === 'localhost' &&
  window.location.port !== '' &&
  window.location.port !== String(DEV_API_PORT);

const apiBase = (needsLocalApi ? `http://localhost:${DEV_API_PORT}` : API_BASE).replace(
  /\/$/,
  '',
);

export const API_URL = `${apiBase}/api/feedback`;
export const AI_IMPROVE_URL = `${apiBase}/api/ai/improve-comment`;
export const AI_STATUS_URL = `${apiBase}/api/ai/status`;
