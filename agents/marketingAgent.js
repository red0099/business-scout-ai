// agents/marketingAgent.js
export default async function marketingAgent(payload = {}, ctx = {}) {
  try {
    const title = 'خطة التسويق';
    const content = `إطار عمل تسويقي مبدئي للمشروع "${payload.name || ''}".`;
    return { success: true, title, content, data: null, errors: [] };
  } catch (err) {
    return { success: false, title: 'خطة التسويق', content: '', data: null, errors: [String(err.message || err)] };
  }
}
