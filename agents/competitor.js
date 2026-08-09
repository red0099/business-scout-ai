import { competitorPrompt } from '../prompts/prompts/competitor.js';
import { DEFAULT_MODEL } from '../config/config.js';

export const CompetitorAgent = {
  id: 'competitor',
  name: 'Competitor Agent',
  description: 'Analyzes direct and indirect competitors and produces competitive matrices.',
  async run(payload = {}, context = {}) {
    const { aiChat, apiKey, model } = context;
    if (!aiChat) throw new Error('context.aiChat is required for CompetitorAgent');
    const usedModel = model || DEFAULT_MODEL;

    const prompt = `${competitorPrompt}\n\n# User Input\nProject name: ${payload.name || 'N/A'}\nSector: ${payload.sector || 'N/A'}\nLocation: ${payload.location || 'N/A'}`;

    const request = {
      model: usedModel,
      messages: [
        { role: 'system', content: 'You are a competitive intelligence analyst.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1200
    };

    const raw = await aiChat('groq', request, apiKey, { model: usedModel });
    const content = raw?.choices?.[0]?.message?.content ?? raw?.choices?.[0]?.text ?? '';
    return { rawProviderResponse: raw, content };
  }
};

export default CompetitorAgent;
