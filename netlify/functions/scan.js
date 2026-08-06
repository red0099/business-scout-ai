// netlify/functions/scan.js
// Netlify Function that runs the configured agents in parallel and returns a merged report.

import { runAgents } from '../../services/agentRunner.js';

const DEFAULT_TIMEOUT_MS = parseInt(process.env.SCAN_TIMEOUT_MS || '30000', 10);

function makeResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

export async function handler(event, context) {
  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return makeResponse(405, { success: false, report: '', sections: [], errors: [{ message: 'الطريقة غير مسموحة. استخدم POST.' }], timestamp: new Date().toISOString(), error: 'Method Not Allowed', message: 'Method Not Allowed' });
  }

  // Parse and validate input
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    console.error('scan: invalid JSON body', err?.stack || err);
    return makeResponse(400, {
      success: false,
      report: '',
      sections: [],
      errors: [{ code: 'invalid_json', message: 'جسم الطلب غير صالح: JSON غير صالح.' }],
      timestamp: new Date().toISOString(),
      error: 'Invalid JSON',
      message: 'جسم الطلب غير صالح'
    });
  }

  // Determine API key (server-side environment preferred)
  const apiKey = body.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('scan: missing API key');
    return makeResponse(400, {
      success: false,
      report: '',
      sections: [],
      errors: [{ code: 'missing_api_key', message: 'مفتاح API مفقود في الخادم.' }],
      timestamp: new Date().toISOString(),
      error: 'Missing API key',
      message: 'مفتاح API مفقود'
    });
  }

  // Basic payload validation (name is required)
  const payload = {
    name: body.name,
    sector: body.sector,
    budget: body.budget,
    location: body.location,
    description: body.description
  };

  if (!payload.name || String(payload.name).trim().length === 0) {
    console.warn('scan: missing project name');
    return makeResponse(400, {
      success: false,
      report: '',
      sections: [],
      errors: [{ code: 'missing_name', message: 'الرجاء إدخال اسم المشروع.' }],
      timestamp: new Date().toISOString(),
      error: 'Missing name',
      message: 'الرجاء إدخال اسم المشروع.'
    });
  }

  // Run agents with timeout protection
  const timeoutMs = Number.isFinite(Number(DEFAULT_TIMEOUT_MS)) ? Number(DEFAULT_TIMEOUT_MS) : 30000;
  console.info('scan: starting agents', { name: payload.name, timeoutMs });

  try {
    const runPromise = runAgents(payload, { apiKey });

    const result = await Promise.race([
      runPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
    ]);

    // Normalize result to the unified response shape
    const normalized = {
      success: !!result && result.success === true,
      report: (result && result.report) || '',
      sections: (result && Array.isArray(result.sections) ? result.sections : []),
      errors: (result && Array.isArray(result.errors) ? result.errors : []),
      timestamp: new Date().toISOString()
    };

    // For backward compatibility also expose top-level error/message when there is an error
    if (!normalized.success) {
      normalized.error = normalized.errors[0]?.message || 'Agents returned errors';
      normalized.message = normalized.error;
    }

    console.info('scan: completed', { success: normalized.success, errorsCount: normalized.errors.length });

    return makeResponse(200, normalized);
  } catch (err) {
    // Distinguish timeout
    const isTimeout = String(err?.message || '').toLowerCase().includes('timeout') || err?.name === 'AbortError';
    console.error('scan: handler error', err?.stack || err);

    if (isTimeout) {
      return makeResponse(504, {
        success: false,
        report: '',
        sections: [],
        errors: [{ code: 'timeout', message: 'انتهت مهلة تشغيل الوكلاء. حاول مرة أخرى لاحقًا.' }],
        timestamp: new Date().toISOString(),
        error: 'Timeout',
        message: 'انتهت مهلة التشغيل'
      });
    }

    return makeResponse(500, {
      success: false,
      report: '',
      sections: [],
      errors: [{ code: 'internal_error', message: 'حدث خطأ في الخادم أثناء معالجة الطلب.' }],
      timestamp: new Date().toISOString(),
      error: 'Internal error',
      message: 'حدث خطأ في الخادم'
    });
  }
}
