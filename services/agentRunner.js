// services/agentRunner.js
// Dynamically discovers and runs all agents in the agents/ directory.

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENTS_DIR = path.join(__dirname, '../agents');

/**
 * Run all agents concurrently and return their results.
 * Each agent module must export a default async function(payload, ctx) returning
 * { success, title, content, data, errors }
 *
 * @param {object} payload
 * @param {object} options
 */
export async function runAgents(payload = {}, options = {}) {
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;
  const model = options.model || process.env.DEFAULT_MODEL || 'default';

  const ctx = { apiKey, model };

  let files = [];
  try {
    files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.js'));
  } catch (err) {
    console.error('agentRunner: failed to read agents directory', err?.stack || err);
    return { agents: [], error: 'agents_dir_unavailable' };
  }

  const promises = files.map(async (file) => {
    const id = file.replace(/\.js$/, '');
    const fullPath = path.join(AGENTS_DIR, file);
    try {
      const mod = await import(pathToFileURL(fullPath).href);
      const fn = mod && (mod.default || mod.run || mod);
      if (typeof fn !== 'function') {
        return { id, success: false, title: id, content: '', data: null, errors: ['agent_not_function'] };
      }
      try {
        const out = await fn(payload, ctx);
        // Ensure shape
        return {
          id,
          success: !!out && out.success === true,
          title: out?.title || id,
          content: out?.content || '',
          data: out?.data || null,
          errors: Array.isArray(out?.errors) ? out.errors : (out?.errors ? [out.errors] : [])
        };
      } catch (err) {
        console.error(`agentRunner: agent ${id} failed`, err?.stack || err);
        return { id, success: false, title: id, content: '', data: null, errors: [String(err?.message || err)] };
      }
    } catch (err) {
      console.error(`agentRunner: failed to import ${file}`, err?.stack || err);
      return { id, success: false, title: id, content: '', data: null, errors: [String(err?.message || err)] };
    }
  });

  const settled = await Promise.allSettled(promises);
  const agents = settled.map((s, idx) => {
    if (s.status === 'fulfilled') return s.value;
    const file = files[idx];
    const id = file ? file.replace(/\.js$/, '') : `agent_${idx}`;
    return { id, success: false, title: id, content: '', data: null, errors: [String(s.reason || 'rejected')] };
  });

  return { agents };
}
