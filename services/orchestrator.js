import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function executePipeline(url) {
  console.log("🚀 Orchestrator analyzing:", url);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `
أنت محلل أعمال خبير في السوق المغربي.

حلل الموقع التالي:
${url}

أعد تقريراً احترافياً بصيغة JSON فقط، بدون Markdown وبدون أي نص خارج JSON.

يجب أن يحتوي التقرير على:
{
  "market": "تحليل السوق",
  "competitor": "تحليل المنافسين",
  "financial": "التحليل المالي",
  "risk": "تحليل المخاطر",
  "marketing": "استراتيجية التسويق",
  "legal": "الجوانب القانونية",
  "funding": "خيارات التمويل",
  "report": "التقرير والخلاصة النهائية"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const results = JSON.parse(clean);

    return results;
  } catch (error) {
    console.error("❌ Gemini error:", error);

    return {
      error: "فشل تحليل Gemini",
      details: error?.message || String(error)
    };
  }
}
