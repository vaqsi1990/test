import { AI_IMPROVE_URL, AI_STATUS_URL } from './config.js';

const commentField = document.getElementById('comment');
const aiToolbar = document.getElementById('aiToolbar');
const aiHint = document.getElementById('aiHint');
const aiUndoBtn = document.getElementById('aiUndoBtn');

const modeLabels = {
  formal: 'Официально',
  shorten: 'Коротко',
  polite: 'Вежливо',
};

let previousText = null;
let isBusy = false;

function setHint(message, type = 'info') {
  aiHint.textContent = message;
  aiHint.hidden = !message;
  aiHint.classList.toggle('form-ai-hint--success', type === 'success');
  aiHint.classList.toggle('form-ai-hint--error', type === 'error');
}

function setBusy(busy) {
  isBusy = busy;
  aiToolbar.querySelectorAll('[data-ai-mode]').forEach((btn) => {
    btn.disabled = busy || btn.dataset.aiDisabled === 'true';
  });
  aiUndoBtn.disabled = busy || previousText === null;
  aiToolbar.classList.toggle('form-tone--loading', busy);
}

async function checkAiStatus() {
  try {
    const response = await fetch(AI_STATUS_URL);
    const data = await response.json();

    if (!data.configured) {
      aiToolbar.querySelectorAll('[data-ai-mode]').forEach((btn) => {
        btn.disabled = true;
        btn.dataset.aiDisabled = 'true';
      });
      setHint('AI: добавьте OPENAI_API_KEY в backend/.env', 'error');
    }
  } catch {
    setHint('Запустите backend (npm run dev) для AI.', 'error');
  }
}

async function runAi(mode) {
  const draft = commentField.value.trim();

  if (draft.length < 3) {
    setHint('Сначала напишите черновик (минимум 3 символа).', 'error');
    return;
  }

  previousText = commentField.value;
  aiUndoBtn.disabled = false;
  setBusy(true);
  setHint(`${modeLabels[mode]}…`);

  try {
    const response = await fetch(AI_IMPROVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: draft, mode }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      commentField.value = data.text;
      setHint('Готово. Проверьте текст и отправьте форму.', 'success');
      return;
    }

    previousText = null;
    aiUndoBtn.disabled = true;
    setHint(data.message || 'Не удалось обработать текст.', 'error');
  } catch {
    previousText = null;
    aiUndoBtn.disabled = true;
    setHint('Нет связи с сервером.', 'error');
  } finally {
    setBusy(false);
  }
}

aiToolbar.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-ai-mode]');
  if (!btn || isBusy) return;
  runAi(btn.dataset.aiMode);
});

aiUndoBtn.addEventListener('click', () => {
  if (previousText === null) return;
  commentField.value = previousText;
  previousText = null;
  aiUndoBtn.disabled = true;
  setHint('Восстановлен исходный текст.', 'success');
});

checkAiStatus();
