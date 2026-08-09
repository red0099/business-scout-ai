// agents/roadmapAgent.js
export default async function roadmapAgent(payload = {}, ctx = {}) {
  try {
    const title = 'خارطة الطريق';
    const content = `مراحل تنفيذية مقترحة للمشروع "${payload.name || ''}".`;
    return { success: true, title, content, data: null, errors: [] };
  } catch (err) {
    return { success: false, title: 'خارطة الطريق', content: '', data: null, errors: [String(err.message || err)] };
  }
}
