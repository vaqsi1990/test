const API_PORT = 3000;

const onApiServer =
  window.location.port === String(API_PORT) ||
  (window.location.port === '' && window.location.hostname === 'localhost');

const apiBase = onApiServer ? '' : `http://localhost:${API_PORT}`;

export const API_URL = `${apiBase}/api/feedback`;
export const AI_IMPROVE_URL = `${apiBase}/api/ai/improve-comment`;
export const AI_STATUS_URL = `${apiBase}/api/ai/status`;
