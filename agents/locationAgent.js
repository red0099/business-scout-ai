// agents/locationAgent.js
export default async function locationAgent(payload = {}, ctx = {}) {
  try {
    const title = 'تحليل الموقع';
    const content = `ملاحظات حول اختيار الموقع: ${payload.location || 'غير محدد'}`;
    return { success: true, title, content, data: null, errors: [] };
  } catch (err) {
    return { success: false, title: 'تحليل الموقع', content: '', data: null, errors: [String(err.message || err)] };
  }
}
