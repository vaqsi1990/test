# Портфолио и форма обратной связи

Лендинг full stack-разработчика с каруселью проектов, контактами и формой обратной связи. Заявки уходят на email через **Brevo**, комментарий можно отредактировать с помощью **OpenAI** (`gpt-4o-mini`).

**Схема:** браузер → Express API → Brevo (письмо владельцу + копия пользователю).

## Возможности

- Секции: о себе, стек, проекты (карусель), как я работаю, контакты
- Карусель проектов из `frontend/projects/projects.json` (3 карточки на десктопе)
- Контакты: Gmail, LinkedIn, Telegram
- Форма: имя, телефон, email, комментарий
- AI: смена тона комментария и краткое резюме в письме владельцу

## Быстрый старт

### 1. Установка

```bash
npm run install:all
```

### 2. Переменные окружения

Создайте `backend/.env`:

```env
PORT=3000
OWNER_EMAIL=ваш@email.com
MAIL_FROM=email-подтверждённый-в-brevo@example.com
MAIL_FROM_NAME=Обратная связь
SITE_NAME=Обратная связь
BREVO_API_KEY=xkeysib-ваш-ключ
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

| Сервис | Назначение |
|--------|------------|
| [Brevo](https://www.brevo.com) | Подтвердите отправителя (Senders), создайте API-ключ |
| [OpenAI](https://platform.openai.com/api-keys) | Без ключа форма работает, кнопки AI отключены |

### 3. Запуск

```bash
npm run dev
```

Откройте **http://localhost:3000** — backend раздаёт frontend и API на одном порту.

> Не открывайте `index.html` через Live Server: запросы к API дадут ошибку **405**. Используйте только `npm run dev`.

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES modules) |
| Backend | Node.js, Express, dotenv, Zod |
| Почта | Brevo API |
| AI | OpenAI Chat Completions |
| Безопасность | helmet, cors, express-rate-limit |

## Структура

```
form/
├── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── js/
│   │   ├── config.js
│   │   ├── env.js
│   │   ├── form.js
│   │   ├── ai.js
│   │   └── carousel.js
│   ├── scripts/write-env.js
│   └── package.json
│   └── projects/
│       ├── projects.json
│       └── *.jpg
└── backend/
    ├── .env
    └── src/
        ├── index.js
        ├── config.js
        ├── routes/
        ├── schemas/feedbackSchema.js
        ├── services/
        ├── templates/
        └── validators/
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/feedback` | Поля: `name`, `phone`, `email`, `comment` |
| `POST` | `/api/ai/improve-comment` | `{ "comment", "mode": "formal" \| "shorten" \| "polite" }` |
| `GET` | `/api/ai/status` | Проверка, настроен ли OpenAI |

Ключ OpenAI хранится только на сервере.

**Лимиты:** 10 заявок / 15 мин, 20 AI-запросов / 15 мин.

## Как работает форма

### Frontend

1. Отправка через `fetch` → `POST /api/feedback` без перезагрузки.
2. Ответы: **200** — успех, **400** — ошибки Zod под полями, **429 / 500** — экран ошибки.
3. Кнопки тона вызывают `POST /api/ai/improve-comment`; «Отменить» возвращает черновик.

### Backend

1. Валидация полей — Zod (`src/schemas/feedbackSchema.js`).
2. При наличии `OPENAI_API_KEY` — резюме комментария в письме владельцу.
3. `sendFeedbackEmails()` — письмо владельцу и копия пользователю (Brevo).

## AI (OpenAI)

| Функция | Описание |
|---------|----------|
| Смена тона | Кнопки «Официально», «Коротко», «Вежливо» — до 2000 символов, таймаут 25 с |
| Резюме | При отправке — 1–2 предложения в письме владельцу; без ключа письмо уходит без резюме |

## Деплой на Render (backend и frontend отдельно)

### 1. Backend — Web Service

| Поле | Значение |
|------|----------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

**Environment variables:**

```env
OWNER_EMAIL=...
MAIL_FROM=...
MAIL_FROM_NAME=Обратная связь
SITE_NAME=Обратная связь
BREVO_API_KEY=...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
SERVE_STATIC=false
FRONTEND_URL=https://ваш-frontend.onrender.com
```

`PORT` задаёт Render автоматически. `SMTP_*` не нужны — используется Brevo API.

После деплоя скопируйте URL backend, например `https://test-api.onrender.com`.

### 2. Frontend — Static Site

| Поле | Значение |
|------|----------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `.` (корень `frontend`) |

**Environment variable:**

```env
PUBLIC_API_URL=https://ваш-backend.onrender.com
```

Build создаёт `js/env.js` с адресом API. Без `PUBLIC_API_URL` форма на Render не найдёт backend.

### 3. Порядок

1. Задеплойте **backend**, возьмите его URL.
2. Задеплойте **frontend** с `PUBLIC_API_URL` = URL backend.
3. В backend укажите `FRONTEND_URL` = URL frontend (без `/` в конце) и сделайте **Redeploy**.

Локально по-прежнему: `npm run dev` — всё на `http://localhost:3000`.

## Автор

**Валериан Маргалитадзе**

- GitHub: [vaqsi1990](https://github.com/vaqsi1990)
- Telegram: [@Vaqsi_Margalitadze](https://t.me/Vaqsi_Margalitadze)
