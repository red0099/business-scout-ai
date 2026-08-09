// agents/grantsAgent.js
export default async function grantsAgent(payload = {}, ctx = {}) {
  try {
    const title = 'المنح والتمويل العام';
    const content = `معلومات عن المنح المحتملة للمشروع "${payload.name || ''}".`;
    return { success: true, title, content, data: null, errors: [] };
  } catch (err) {
    return { success: false, title: 'المنح', content: '', data: null, errors: [String(err.message || err)] };
  }
}
