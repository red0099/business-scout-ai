import { marketPrompt } from '../prompts/market.js';

export const MarketAgent = {
  id: 'market',

  name: 'Market Agent',

  description:
    'Generates market analysis and forecasts using OpenRouter.',

  async run(payload = {}, context = {}) {
    const { aiChat, apiKey } = context;

    if (!aiChat) {
      throw new Error(
        'context.aiChat is required for MarketAgent'
      );
    }

    if (!apiKey) {
      throw new Error(
        'OpenRouter API key is required for MarketAgent'
      );
    }

    const prompt = `
${marketPrompt}

# User Input

Project name: ${payload.name || 'N/A'}
Sector: ${payload.sector || 'N/A'}
Location: ${payload.location || 'N/A'}
Description: ${payload.description || 'N/A'}

أعد تحليل السوق باللغة العربية.
`;

    const request = {
      model: 'openrouter/auto',

      messages: [
        {
          role: 'system',
          content:
            'You are a professional market research expert specializing in the Moroccan market.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],

      max_completion_tokens: 1200
    };

    const raw = await aiChat(
      'openrouter',
      request,
      apiKey,
      {
        model: 'openrouter/auto'
      }
    );

    const content =
      raw?.choices?.[0]?.message?.content ??
      raw?.choices?.[0]?.text ??
      '';

    if (!content) {
      throw new Error(
        'OpenRouter returned empty content for MarketAgent'
      );
    }

    return {
      rawProviderResponse: raw,
      content
    };
  }
};

export default MarketAgent;
