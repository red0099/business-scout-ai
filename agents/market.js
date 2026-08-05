import { marketPrompt } from '../prompts/market.js';
import { DEFAULT_MODEL } from '../config/config.js';

export const MarketAgent = {
  id: 'market',
  name: 'Market Agent',
  description: 'Generates market analysis and forecasts. Uses prompts/market.js for templates.',
  async run(payload = {}, context = {}) {
    const { aiChat, apiKey, model } = context;
    if (!aiChat) throw new Error('context.aiChat is required for MarketAgent');
    const usedModel = model || DEFAULT_MODEL;

    const prompt = `${marketPrompt}\n\n# User Input\nProject name: ${payload.name || 'N/A'}\nSector: ${payload.sector || 'N/A'}\nLocation: ${payload.location || 'N/A'}\nDescription: ${payload.description || 'N/A'}`;

    const request = {
      model: usedModel,
      messages: [
        { role: 'system', content: 'You are a market research expert.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1200
    };

    const raw = await aiChat('groq', request, apiKey, { model: usedModel });
    const content = raw?.choices?.[0]?.message?.content ?? raw?.choices?.[0]?.text ?? '';
    return { rawProviderResponse: raw, content };
  }
};

export default MarketAgent;
