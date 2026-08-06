// services/orchestrator.js
// Central Agent Orchestrator - coordinates execution of multiple agents and normalizes output

import { runAgents } from './agentRunner.js';

/**
 * Execute agents and return a normalized result object.
 * Keeps backward-compatible fields: success, report, sections, errors, timestamp
 */
export async function executeAgents(payload = {}, options = {}) {
  console.info('orchestrator: starting execution', { name: payload?.name });
  try {
    const result = await runAgents(payload, options);

    // Normalize result to ensure consistent fields
    const normalized = {
      success: !!result && result.success === true,
      report: (result && result.report) || '',
      sections: (result && Array.isArray(result.sections) ? result.sections : []),
      errors: (result && Array.isArray(result.errors) ? result.errors : []),
      timestamp: new Date().toISOString()
    };

    if (!normalized.success && normalized.errors.length > 0) {
      normalized.error = normalized.errors[0]?.message || 'Agents returned errors';
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
