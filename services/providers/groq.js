// services/providers/groq.js
// Groq provider adapter using OpenAI-compatible chat completions endpoint.
// This adapter intentionally only exposes sendChat and does not execute any network calls during static checks.

export async function sendChat(request, apiKey, options = {}) {
  if (!apiKey) throw new Error('Groq API key required');
  const endpoint = (options.baseUrl || 'https://api.groq.com/openai/v1') + '/chat/completions';
  const body = Object.assign({}, request, { model: options.model || request.model });

  // Normalize token parameter names: prefer max_completion_tokens
  if (body.max_tokens != null && body.max_completion_tokens == null) {
    body.max_completion_tokens = body.max_tokens;
    delete body.max_tokens;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    const err = data?.error?.message || data?.error || `Groq request failed with status ${res.status}`;
    throw new Error(err);
  }
  return data;
}
