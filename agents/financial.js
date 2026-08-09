import { financialPrompt } from '../prompts/prompts/financial.js';
import { DEFAULT_MODEL } from '../config/config.js';

export const FinancialAgent = {
  id: 'financial',
  name: 'Financial Agent',
  description: 'Prepares financial models, CAPEX/OPEX, cash flow, and break-even analysis.',
  async run(payload = {}, context = {}) {
    const { aiChat, apiKey, model } = context;
    if (!aiChat) throw new Error('context.aiChat is required for FinancialAgent');
    const usedModel = model || DEFAULT_MODEL;

    const prompt = `${financialPrompt}\n\n# User Input\nProject name: ${payload.name || 'N/A'}\nBudget: ${payload.budget || 'N/A'}\nLocation: ${payload.location || 'N/A'}\nDescription: ${payload.description || 'N/A'}`;

    const request = {
      model: usedModel,
      messages: [
        { role: 'system', content: 'You are a senior financial consultant.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1500
    };

    const raw = await aiChat('groq', request, apiKey, { model: usedModel });
    const content = raw?.choices?.[0]?.message?.content ?? raw?.choices?.[0]?.text ?? '';
    return { rawProviderResponse: raw, content };
  }
};

export default FinancialAgent;
