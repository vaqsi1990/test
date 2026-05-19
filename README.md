# Портфолио и форма обратной связи

Лендинг + форма обратной связи. **Frontend** (Static Site) и **Backend** (API) деплоятся на Render отдельно.

**Схема:** браузер → Express API → Brevo (письмо владельцу + копия пользователю). AI — OpenAI (`gpt-4o-mini`).

## Локальная разработка

```bash
npm run install:all
# backend/.env — см. backend/.env.example
npm run dev
```

Backend: `http://localhost:3000`. Frontend откройте через Live Server или `npx serve frontend` — в `frontend/js/env.js` оставьте `API_BASE = ''` (запросы пойдут на `:3000` автоматически с Live Server).

## Деплой на Render

### Backend (Web Service)

| | |
|---|---|
| Root Directory | `backend` |
| Build | `npm install` |
| Start | `npm start` |

```env
OWNER_EMAIL=...
MAIL_FROM=...
MAIL_FROM_NAME=Обратная связь
SITE_NAME=Обратная связь
BREVO_API_KEY=...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
FRONTEND_URL=https://ваш-frontend.onrender.com
```

### Frontend (Static Site)

| | |
|---|---|
| Root Directory | `frontend` |
| Build | `npm run build` |
| Publish Directory | `.` |

```env
PUBLIC_API_URL=https://test-44z5.onrender.com
```

1. Deploy backend → скопируйте URL  
2. Deploy frontend с `PUBLIC_API_URL`  
3. В backend укажите `FRONTEND_URL` → Redeploy  

## API

| Метод | Путь |
|-------|------|
| `GET` | `/api/health` |
| `POST` | `/api/feedback` |
| `POST` | `/api/ai/improve-comment` |
| `GET` | `/api/ai/status` |

## Структура

```
form/
├── frontend/          # Static Site
│   ├── index.html
│   ├── js/
│   └── scripts/write-env.js
└── backend/           # Web Service
    └── src/
        ├── routes/
        ├── schemas/
        ├── services/
        └── templates/
```

## Автор

**Валериан Маргалитадзе** — [GitHub](https://github.com/vaqsi1990) · [Telegram](https://t.me/Vaqsi_Margalitadze)
