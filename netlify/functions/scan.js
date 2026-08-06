// netlify/functions/scan.js
// Lightweight Netlify Function entry for scan - delegates agent execution to services/orchestrator.js

import { executeAgents } from '../../services/orchestrator.js';

const DEFAULT_TIMEOUT_MS = parseInt(process.env.SCAN_TIMEOUT_MS || '30000', 10);

function makeResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return makeResponse(405, { success: false, report: '', sections: [], errors: [{ message: 'الطريقة غير مسموحة. استخدم POST.' }], timestamp: new Date().toISOString(), error: 'Method Not Allowed', message: 'Method Not Allowed' });
  }

  // Parse input JSON
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

  const timeoutMs = Number.isFinite(Number(DEFAULT_TIMEOUT_MS)) ? Number(DEFAULT_TIMEOUT_MS) : 30000;
  console.info('scan: delegating to orchestrator', { name: payload.name, timeoutMs });

  try {
    const execPromise = executeAgents(payload, { apiKey });

    const result = await Promise.race([
      execPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
    ]);

    // result is normalized by orchestrator
    const normalized = {
      success: !!result && result.success === true,
      report: (result && result.report) || '',
      sections: (result && Array.isArray(result.sections) ? result.sections : []),
      errors: (result && Array.isArray(result.errors) ? result.errors : []),
      timestamp: new Date().toISOString()
    };

    if (!normalized.success) {
      normalized.error = normalized.errors[0]?.message || 'Agents returned errors';
      normalized.message = normalized.error;
    }

    console.info('scan: orchestrator result', { success: normalized.success, errorsCount: normalized.errors.length });
    return makeResponse(200, normalized);
  } catch (err) {
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
