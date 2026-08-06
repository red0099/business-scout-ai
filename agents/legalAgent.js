// agents/legalAgent.js
export default async function legalAgent(payload = {}, ctx = {}) {
  try {
    const title = 'الاستشارة القانونية';
    const content = `ملاحظات قانونية أولية للمشروع "${payload.name || ''}".`;
    return { success: true, title, content, data: null, errors: [] };
  } catch (err) {
    return { success: false, title: 'الاستشارة القانونية', content: '', data: null, errors: [String(err.message || err)] };
  }
}
