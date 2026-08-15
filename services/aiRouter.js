// services/aiRouter.js
// Central AI router that selects provider implementation.

import * as groq from './providers/groq.js';
import * as openrouter from './providers/openrouter.js';

export const providers = {
  groq,
  openrouter
};

export async function aiChat(providerName, request, apiKey, options = {}) {
  const key = (providerName || 'groq').toLowerCase();
  const provider = providers[key];

  if (!provider) {
    throw new Error(`AI provider not supported: ${providerName}`);
  }

  if (typeof provider.sendChat !== 'function') {
    throw new Error(
      `Provider implementation missing sendChat: ${providerName}`
    );
  }

  return provider.sendChat(request, apiKey, options);
}
