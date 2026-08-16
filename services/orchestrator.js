function parseModelContent(content) {
  if (typeof content !== "string") {
    if (content && typeof content === "object") {
      return content;
    }

    throw new Error("Model returned empty or invalid content");
  }

  let text = content.trim();

  // Remove Markdown code fences if the model returned them
  text = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First attempt: parse the complete response as JSON
  try {
    return JSON.parse(text);
  } catch {
    // Continue with extraction below
  }

  // Second attempt: extract the JSON object from surrounding text
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start >= 0 && end > start) {
    const jsonText = text.slice(start, end + 1);

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      throw new Error(
        `Model returned malformed JSON: ${error.message}`
      );
    }
  }

  throw new Error("Model returned invalid JSON");
}

async function executePipeline(url) {
  console.log(
    "🚀 Orchestrator analyzing with OpenRouter:",
    url
  );

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not configured"
      );
    }

    if (!url || typeof url !== "string") {
      throw new Error("A valid URL is required");
    }

    const prompt = `
أنت محلل أعمال خبير في السوق المغربي.

حلل الموقع التالي:
${url}

أعد تقريراً احترافياً.

مهم جداً:
- أعد JSON صالحاً فقط.
- لا تستخدم Markdown.
- لا تستخدم code fence.
- لا تضف أي نص قبل أو بعد JSON.
- يجب أن يكون الرد قابلاً للمعالجة مباشرة بواسطة JSON.parse().
- استخدم اللغة العربية في محتوى التقرير.

يجب أن يحتوي JSON على هذه المفاتيح بالضبط:

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
          model: "openrouter/auto",

          messages: [
            {
              role: "user",
              content: prompt
            }
          ],

          response_format: {
            type: "json_object"
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `OpenRouter API error ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    const content =
      data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "OpenRouter returned no message content: " +
        JSON.stringify(data)
      );
    }

    // Use the dedicated parser instead of JSON.parse directly
    const results = parseModelContent(content);

    // Validate the expected structure
    if (
      !results ||
      typeof results !== "object" ||
      Array.isArray(results)
    ) {
      throw new Error(
        "OpenRouter returned JSON, but the result is not a JSON object"
      );
    }

    return results;

  } catch (error) {
    console.error(
      "❌ OpenRouter error:",
      error
    );

    return {
      error: "فشل التحليل باستخدام OpenRouter",
      details: error.message
    };
  }
}

export {
  executePipeline,
  parseModelContent
};
