export 
function parseModelContent(content) {
  if (typeof content !== 'string') return content;
  let text = content.trim();

  if (text.startsWith('```')) {
    text = text.replace(/^\```(?:json)?\s*/i, '').replace(/\s*\```$/, '').trim();
  }

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error('Model returned invalid JSON');
  }
}

async function executePipeline(url) { console.log("🚀 Orchestrator analyzing with OpenRouter:", url); const apiKey = process.env.OPENROUTER_API_KEY; if (!apiKey) { throw new Error("OPENROUTER_API_KEY is not configured"); } const prompt = `أنت محلل أعمال خبير في السوق المغربي. حلل الموقع التالي: ${url}. أعد تقريراً احترافياً بصيغة JSON فقط، بدون Markdown وبدون أي نص خارج JSON. يجب أن يحتوي التقرير على: { "market": "تحليل السوق", "competitor": "تحليل المنافسين", "financial": "التحليل المالي", "risk": "تحليل المخاطر", "marketing": "استراتيجية التسويق", "legal": "الجوانب القانونية", "funding": "خيارات التمويل", "report": "التقرير والخلاصة النهائية" }`; try { const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ model: "openrouter/auto", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } }) }); if (!response.ok) { throw new Error(`OpenRouter API error: ${response.status}`); } const data = await response.json(); const content = data.choices[0].message.content; let results; try { results = JSON.parse(content); } catch (parseError) { const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim(); results = JSON.parse(cleaned); } return results; } catch (error) { console.error("❌ OpenRouter error:", error); return { error: "فشل التحليل باستخدام OpenRouter", details: error.message }; } }

export { executePipeline };
