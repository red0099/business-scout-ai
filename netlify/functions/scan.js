// netlify/functions/scan.js
// Netlify Function that runs the configured agents in parallel and returns a merged report.

import { runAgents } from '../../services/agentRunner.js';

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const apiKey = body.apiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing API key' }) };
    }

    const payload = {
      name: body.name,
      sector: body.sector,
      budget: body.budget,
      location: body.location,
      description: body.description
    };

    const result = await runAgents(payload, { apiKey });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error('scan function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Internal error' }) };
  }
}
