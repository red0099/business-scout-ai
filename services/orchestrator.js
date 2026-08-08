/**
 * Orchestrator - runs the analysis pipeline in order.
 * Pipeline: Market, Competitor, Financial, Risk, Marketing, Legal, Funding, Report
 *
 * Each step is implemented as an async function that accepts a shared `context` object
 * and may add its findings to `context.results` under its step name.
 *
 * This is a single-file orchestrator so it works even if per-step modules don't exist yet.
 */

async function runPipeline(input = {}) {
  const context = {
    input,
    results: {},
    meta: { startedAt: new Date().toISOString() },
  };

  const steps = [
    { name: 'Market', fn: Market },
    { name: 'Competitor', fn: Competitor },
    { name: 'Financial', fn: Financial },
    { name: 'Risk', fn: Risk },
    { name: 'Marketing', fn: Marketing },
    { name: 'Legal', fn: Legal },
    { name: 'Funding', fn: Funding },
    { name: 'Report', fn: Report },
  ];

  for (const step of steps) {
    try {
      // allow step functions to update context.results[step.name]
      const out = await step.fn(context);
      context.results[step.name] = out;
    } catch (err) {
      // Record the error and stop the pipeline (optional: continue depending on requirements)
      context.results[step.name] = { error: err.message || String(err) };
      context.meta.failedAt = step.name;
      context.meta.endedAt = new Date().toISOString();
      return context; // stop on first failure
    }
  }

  context.meta.endedAt = new Date().toISOString();
  return context;
}

// --- Pipeline step implementations (placeholders / simple examples) ---
// Replace these with real implementations or import modules when available.

async function Market(context) {
  const company = context.input.company || 'unknown';
  // Placeholder analysis
  return {
    summary: `Market overview for ${company}`,
    topTrends: ['trendA', 'trendB'],
  };
}

async function Competitor(context) {
  const company = context.input.company || 'unknown';
  return {
    summary: `Competitor landscape for ${company}`,
    competitors: [
      { name: 'Competitor 1', strength: 'high' },
      { name: 'Competitor 2', strength: 'medium' },
    ],
  };
}

async function Financial(context) {
  return {
    summary: 'Financial overview (projected)',
    revenueEstimate: 1000000,
    marginEstimate: 0.25,
  };
}

async function Risk(context) {
  return {
    summary: 'Key risks identified',
    risks: ['regulatory', 'market-volatility'],
  };
}

async function Marketing(context) {
  return {
    summary: 'Marketing plan sketch',
    channels: ['digital', 'partnerships'],
  };
}

async function Legal(context) {
  return {
    summary: 'Legal considerations',
    items: ['IP', 'compliance'],
  };
}

async function Funding(context) {
  return {
    summary: 'Funding options',
    options: ['seed', 'angel', 'vc'],
  };
}

async function Report(context) {
  // Combine previous results into a short report
  return {
    title: `Analysis Report for ${context.input.company || 'Company'}`,
    createdAt: new Date().toISOString(),
    sections: context.results,
  };
}

module.exports = { runPipeline };
