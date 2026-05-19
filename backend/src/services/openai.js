import { config } from '../config.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 25000;

const PROMPTS = {
  formal:
    'Перепиши сообщение в официально-деловом стиле: сдержанно, уважительно, без разговорных выражений. Сохрани смысл и язык оригинала. Только готовый текст, без кавычек и пояснений.',
  shorten:
    'Сократи сообщение до 1–3 коротких предложений, сохрани главную мысль. Язык как в оригинале. Только текст, без пояснений.',
  polite:
    'Перепиши сообщение в мягком вежливом тоне: «пожалуйста», «буду благодарен», уважительное обращение. Сохрани смысл и язык оригинала. Только готовый текст, без кавычек и пояснений.',
};

async function chat(systemPrompt, userPrompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: config.openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = await response.json();
        detail = body.error?.message || detail;
      } catch {
        /* ignore */
      }
      throw new Error(detail);
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error('Пустой ответ от OpenAI');
    }

    if (
      (text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith('«') && text.endsWith('»'))
    ) {
      text = text.slice(1, -1).trim();
    }

    return text;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('OpenAI не ответил вовремя. Попробуйте ещё раз.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function improveComment(draft, mode = 'formal') {
  const systemPrompt = PROMPTS[mode] || PROMPTS.formal;
  return chat(systemPrompt, draft);
}

export function summarizeComment(comment) {
  return chat(
    'Краткое резюме обращения клиента в 1–2 предложениях. Укажи суть и желаемое действие, если есть. Только текст на языке оригинала.',
    comment,
  );
}

export function isOpenAiConfigured() {
  return Boolean(config.openaiApiKey);
}
