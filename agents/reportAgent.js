// agents/reportAgent.js
// Aggregates sections into a final Arabic report
export default async function reportAgent(payload = {}, ctx = {}) {
  try {
    const sections = payload.sections || [];
    const now = new Date().toISOString();
    const parts = [];
    parts.push(`# تقرير دراسة الجدوى — Business Scout AI`);
    parts.push(`_تاريخ الإنشاء: ${now}_`);
    parts.push(`\n---\n`);
    parts.push(`## الملخّص التنفيذي`);
    parts.push(`هذا التقرير يجمع مخرجات مجموعة الوكلاء. التفاصيل أدناه.`);
    parts.push(`\n---\n`);

    for (const s of sections) {
      parts.push(`## ${s.title || s.id}`);
      parts.push(s.content || '_لا توجد مخرجات من هذا القسم._');
      parts.push('\n');
    }

    parts.push('---');
    parts.push('_تولّد هذا التقرير تلقائيًا بواسطة Business Scout AI._');

    const content = parts.join('\n\n');
    return { success: true, title: 'تقرير مجمّع', content, data: { sectionsCount: sections.length }, errors: [] };
  } catch (err) {
    return { success: false, title: 'تقرير مجمّع', content: '', data: null, errors: [String(err.message || err)] };
  }
}
