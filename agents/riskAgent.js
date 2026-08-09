// agents/riskAgent.js
export default async function riskAgent(payload = {}, ctx = {}) {
  try {
    const title = 'تقييم المخاطر';
    const content = `تقييم أولي للمخاطر المرتبطة بالمشروع "${payload.name || ''}".`;
    return { success: true, title, content, data: null, errors: [] };
  } catch (err) {
    return { success: false, title: 'تقييم المخاطر', content: '', data: null, errors: [String(err.message || err)] };
  }
}
