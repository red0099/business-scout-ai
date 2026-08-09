// agents/supplierAgent.js
export default async function supplierAgent(payload = {}, ctx = {}) {
  try {
    const title = 'سلسلة التوريد';
    const content = `تحليل المورّدين المحتملين للمشروع "${payload.name || ''}".`;
    return { success: true, title, content, data: null, errors: [] };
  } catch (err) {
    return { success: false, title: 'سلسلة التوريد', content: '', data: null, errors: [String(err.message || err)] };
  }
}
