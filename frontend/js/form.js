import { API_URL } from './config.js';

const form = document.getElementById('feedbackForm');
const cardHeader = document.getElementById('cardHeader');
const formAlert = document.getElementById('formAlert');
const formAlertText = document.getElementById('formAlertText');
const submitBtn = document.getElementById('submitBtn');
const statusSuccess = document.getElementById('statusSuccess');
const statusError = document.getElementById('statusError');
const successText = document.getElementById('successText');
const errorText = document.getElementById('errorText');
const resetBtn = document.getElementById('resetBtn');
const retryBtn = document.getElementById('retryBtn');

const fieldNames = ['name', 'phone', 'email', 'comment'];

showFormView();

function setLoading(isLoading) {
  form.classList.toggle('feedback-form--loading', isLoading);
  submitBtn.disabled = isLoading;
  submitBtn.setAttribute('aria-busy', String(isLoading));
}

function hideAlert() {
  formAlert.hidden = true;
  formAlertText.textContent = '';
}

function showAlert(message) {
  formAlertText.textContent = message;
  formAlert.hidden = false;
}

function clearFieldErrors() {
  fieldNames.forEach((name) => {
    const input = form.elements[name];
    const errorEl = document.getElementById(`error-${name}`);
    input?.classList.remove('form-input--error');
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
  });
}

function showFieldErrors(errors) {
  Object.entries(errors).forEach(([name, message]) => {
    const input = form.elements[name];
    const errorEl = document.getElementById(`error-${name}`);
    if (input) {
      input.classList.add('form-input--error');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  });
}

function showFormView() {
  cardHeader.hidden = false;
  form.hidden = false;
  if (statusSuccess) statusSuccess.hidden = true;
  if (statusError) statusError.hidden = true;
  hideAlert();
}

function showSuccessView(message) {
  if (!statusSuccess || !successText) return;

  cardHeader.hidden = true;
  form.hidden = true;
  if (statusError) statusError.hidden = true;
  hideAlert();
  successText.textContent = message;
  statusSuccess.hidden = false;
  statusSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showErrorView(message) {
  if (!statusError || !errorText) return;

  cardHeader.hidden = true;
  form.hidden = true;
  if (statusSuccess) statusSuccess.hidden = true;
  hideAlert();
  errorText.textContent = message;
  statusError.hidden = false;
  statusError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function submitFeedback(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return { response, data };
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideAlert();
  clearFieldErrors();

  const payload = Object.fromEntries(new FormData(form));

  try {
    setLoading(true);
    const { response, data } = await submitFeedback(payload);

    if (response.ok && data.success !== false) {
      form.reset();
      showSuccessView(
        data.message || 'Сообщение отправлено. Копия письма отправлена на ваш email.',
      );
      return;
    }

    if (response.status === 400 && data.errors) {
      showFieldErrors(data.errors);
      showAlert(data.message || 'Исправьте ошибки в форме.');
      return;
    }

    if (response.status === 405) {
      showErrorView(
        'API недоступен. Откройте http://localhost:3000 и убедитесь, что в backend запущен npm run dev.',
      );
      return;
    }

    if (response.status === 429) {
      showAlert(data.message || 'Слишком много запросов. Подождите и попробуйте снова.');
      return;
    }

    showErrorView(data.message || 'Не удалось отправить сообщение. Попробуйте позже.');
  } catch {
    showErrorView(
      'Сервер не отвечает. Запустите npm run dev в папке backend и откройте http://localhost:3000',
    );
  } finally {
    setLoading(false);
  }
});

fieldNames.forEach((name) => {
  form.elements[name]?.addEventListener('input', () => {
    const input = form.elements[name];
    const errorEl = document.getElementById(`error-${name}`);
    input.classList.remove('form-input--error');
    if (errorEl) {
      errorEl.hidden = true;
    }
  });
});

resetBtn?.addEventListener('click', () => {
  showFormView();
  form.reset();
});

retryBtn?.addEventListener('click', () => {
  showFormView();
});
