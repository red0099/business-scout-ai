import MarketAgent from '../agents/market.js';
import FinancialAgent from '../agents/financial.js';
import CompetitorAgent from '../agents/competitor.js';
import { aiChat } from './aiRouter.js';
import { DEFAULT_MODEL } from '../config/config.js';

/**
 * Build a Markdown report from structured sections.
 * @param {Array<{id:string,name:string,content:string,meta?:object}>} sections
 * @returns {string} Markdown string
 */
export function buildMarkdownFromSections(sections = []) {
  const now = new Date().toISOString();
  const parts = [];
  parts.push(`# تقرير دراسة الجدوى — Business Scout AI`);
  parts.push(`_تاريخ الإنشاء: ${now}_`);
  parts.push(`\n---\n`);
  parts.push(`## الملخّص التنفيذي`);
  parts.push(`هذا التقرير يجمع مخرجات الوكلاء: Market, Financial, Competitor. التفاصيل أدناه.`);
  parts.push(`\n---\n`);

  for (const s of sections) {
    parts.push(`## ${s.name}`);
    parts.push(s.content || '_لا توجد مخرجات من هذا القسم._');
    parts.push('\n');
  }

  parts.push('---');
  parts.push('_تولّد هذا التقرير تلقائيًا بواسطة Business Scout AI._');
  return parts.join('\n\n');
}

/**
 * Run configured agents in parallel and return a structured report object.
 *
 * @param {object} payload - The input payload for agents (project details)
 * @param {object} [options] - Runner options
 * @param {string} [options.apiKey] - API key for the AI provider (overrides env)
 * @param {string} [options.model] - Model to use (overrides config default)
 * @returns {Promise<{success:boolean, report:string, sections:Array, errors:Array}>}
 */
export async function runAgents(payload = {}, options = {}) {
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key for agent runner. Provide options.apiKey or set GROQ_API_KEY in env.');
  }

  const model = options.model || DEFAULT_MODEL;

  const agents = [
    { id: MarketAgent.id || 'market', name: MarketAgent.name || 'Market Agent', run: MarketAgent.run.bind(MarketAgent) },
    { id: FinancialAgent.id || 'financial', name: FinancialAgent.name || 'Financial Agent', run: FinancialAgent.run.bind(FinancialAgent) },
    { id: CompetitorAgent.id || 'competitor', name: CompetitorAgent.name || 'Competitor Agent', run: CompetitorAgent.run.bind(CompetitorAgent) }
  ];

  const ctx = { aiChat, apiKey, model };

  // Run all agents in parallel and collect results; continue even if some fail
  const promises = agents.map(agent => (async () => {
    try {
      const result = await agent.run(payload, ctx);
      return { id: agent.id, name: agent.name, ok: true, result };
    } catch (err) {
      return { id: agent.id, name: agent.name, ok: false, error: err?.message || String(err) };
    }
  })());

  const settledResults = await Promise.allSettled(promises);

  const sections = [];
  const errors = [];

  // settledResults are {status, value|reason}
  for (let i = 0; i < settledResults.length; i++) {
    const sr = settledResults[i];
    let res;
    if (sr.status === 'fulfilled') {
      res = sr.value;
    } else {
      // If a promise unexpectedly rejected, mark the agent as failed
      const agent = agents[i];
      res = { id: agent.id, name: agent.name, ok: false, error: String(sr.reason) };
    }

    if (res.ok) {
      const content = (res.result && (res.result.content || (res.result.rawProviderResponse && (res.result.rawProviderResponse.choices?.[0]?.message?.content || res.result.rawProviderResponse.choices?.[0]?.text)))) || '';
      sections.push({ id: res.id, name: res.name, content, meta: res.result.meta || {} });
    } else {
      errors.push({ id: res.id, name: res.name, error: res.error });
    }
  }

  const markdown = buildMarkdownFromSections(sections);
  const success = errors.length === 0;

  return {
    success,
    report: markdown,
    sections,
    errors
  };
}
