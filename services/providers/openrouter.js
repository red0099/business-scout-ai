export async function sendChat(request, apiKey, options = {}) {
  if (!apiKey) {
    throw new Error('OpenRouter API key required');
  }

  const endpoint =
    (options.baseUrl || 'https://openrouter.ai/api/v1') +
    '/chat/completions';

  const body = Object.assign({}, request, {
    model: options.model || request.model
  });

  if (!body.model) {
    throw new Error('OpenRouter model required');
  }

  if (body.max_tokens != null && body.max_completion_tokens == null) {
    body.max_completion_tokens = body.max_tokens;
    delete body.max_tokens;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  if (process.env.OPENROUTER_SITE_URL) {
    headers['HTTP-Referer'] = process.env.OPENROUTER_SITE_URL;
  }

  if (process.env.OPENROUTER_APP_NAME) {
    headers['X-Title'] = process.env.OPENROUTER_APP_NAME;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    const err =
      data?.error?.message ||
      data?.error ||
      `OpenRouter request failed with status ${res.status}`;

    throw new Error(
      typeof err === 'string' ? err : JSON.stringify(err)
    );
  }

  return data;
}
