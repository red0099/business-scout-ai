// services/orchestrator.js
// Central Agent Orchestrator - coordinates execution of multiple agents and normalizes output

import { runAgents } from './agentRunner.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Import reportAgent explicitly to aggregate final report
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORT_AGENT_PATH = path.join(__dirname, '../agents/reportAgent.js');

export async function executeAgents(payload = {}, options = {}) {
  console.info('orchestrator: starting execution', { name: payload?.name });
  try {
    const { agents: agentResults } = await runAgents(payload, options);

    const sections = [];
    const errors = [];

    for (const a of agentResults || []) {
      if (a && a.success) {
        sections.push({ id: a.id, title: a.title, content: a.content, data: a.data });
      } else {
        errors.push({ id: a?.id, error: a?.errors || ['Unknown agent error'] });
      }
    }

    // Try to import and run reportAgent to merge sections
    let report = '';
    try {
      const mod = await import(`file://${REPORT_AGENT_PATH}`);
      const fn = mod && (mod.default || mod.run || mod);
      if (typeof fn === 'function') {
        const out = await fn({ sections, payload }, options);
        report = out?.content || '';
      } else {
        console.warn('orchestrator: reportAgent not a function');
      }
    } catch (err) {
      console.error('orchestrator: failed to run reportAgent', err?.stack || err);
      // fallback: concatenate sections
      report = sections.map(s => `## ${s.title}\n\n${s.content || ''}`).join('\n\n');
    }

    const normalized = {
      success: (errors.length === 0),
      report: report || '',
      sections,
      errors,
      timestamp: new Date().toISOString()
    };

    if (!normalized.success && normalized.errors.length > 0) {
      normalized.error = normalized.errors[0]?.error || 'Agents returned errors';
      normalized.message = normalized.error;
    }

    console.info('orchestrator: finished execution', { success: normalized.success, errorsCount: normalized.errors.length });
    return normalized;
  } catch (err) {
    console.error('orchestrator: uncaught error during agent execution', err?.stack || err);
    return {
      success: false,
      report: '',
      sections: [],
      errors: [{ code: 'orchestrator_internal', message: 'حدث خطأ داخلي أثناء تنسيق مخرجات الوكلاء.' }],
      timestamp: new Date().toISOString(),
      error: 'Orchestrator error',
      message: 'حدث خطأ داخلي'
    };
  }
}
