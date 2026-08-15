export
function parseModelContent(content) {
  let s = String(content ?? '').trim();
  s = s.replace(/^\`\`\`(?:json)?\s*/i, '');
  s = s.replace(/\s*\`\`\`$/i, '');

  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');

  if (start >= 0 && end > start) {
    s = s.slice(start, end + 1);
  }

  return JSON.parse(s);
}

export async function executePipeline(url) {
  console.log("🚀 بدء تحليل المشروع:", url);

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY غير موجود");
    }

    const prompt = `
أنت خبير في تحليل المشاريع والأعمال في المغرب.

حلل المشروع التالي:
${url}

أعطني تحليلاً باللغة العربية يشمل:
- تحليل السوق
- تحليل المنافسين
- الزبائن المستهدفين
- نموذج العمل
- التكاليف
- الأرباح المتوقعة
- المخاطر
- استراتيجية التسويق
- الجوانب القانونية
- خيارات التمويل
- الخلاصة والتوصية

أرجع النتيجة بصيغة JSON صحيحة فقط، بدون Markdown وبدون علامات code fence.

الصيغة المطلوبة:
{
  "market": "تحليل السوق",
  "competitor": "تحليل المنافسين",
  "financial": "التحليل المالي",
  "risk": "تحليل المخاطر",
  "marketing": "استراتيجية التسويق",
  "legal": "الجوانب القانونية",
  "funding": "خيارات التمويل",
  "report": "الخلاصة والتوصية"
}
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://business-scout.vercel.app",
          "X-Title": "Business Scout AI"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const text = await response.text();

    console.log("OpenRouter Status:", response.status);
    console.log("OpenRouter Response:", text);

    if (!response.ok) {
      throw new Error(
        `OpenRouter Error ${response.status}: ${text}`
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("OpenRouter رجع استجابة غير صالحة");
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "OpenRouter لم يرجع نتيجة للتحليل: " +
        JSON.stringify(data)
      );
    }

    try {
      return JSON.parse(content);
    } catch {
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned);
    }

  } catch (error) {
    console.error("❌ OpenRouter error:", error);

    return {
      error: "فشل تحليل المشروع",
      details: error.message
    };
  }
}
