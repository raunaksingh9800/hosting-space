import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");
  return new GoogleGenerativeAI(key);
}

/* ============================
   1️⃣ GENERATE NEW WEBSITE
============================ */
export async function generateHtmlWithGemini(
  prompt: string,
  name: string,
  apiKey?: string
): Promise<string> {
  const genAI = getGeminiClient(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });

  const fullPrompt = `
You are an expert web developer.

Create a COMPLETE, production-ready HTML5 website.

Website name: "${name}"

User request:
"${prompt}"

Rules:
- Use clean semantic HTML
- Include inline CSS (no external libraries)
- Mobile responsive
- Return ONLY full HTML
- Wrap output in \`\`\`html

Do NOT explain anything.
`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: fullPrompt }],
      },
    ],
  });

  const text = result.response.text();
  const match = text.match(/```html([\s\S]*?)```/i);

  if (!match) {
    throw new Error("Gemini did not return valid HTML");
  }

  return match[1].trim();
}

/* ============================
   2️⃣ EDIT EXISTING WEBSITE
============================ */
export async function editHtmlWithGemini(
  existingHtml: string,
  editPrompt: string,
  name: string,
  apiKey?: string
): Promise<{ html: string; message: string }> {
  const genAI = getGeminiClient(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });

  const fullPrompt = `
Update the following HTML for "${name}".

Instruction:
"${editPrompt}"

Rules:
- Return COMPLETE updated HTML
- Wrap output in \`\`\`html
- Also give a short summary of what changed

Current HTML:
${existingHtml}
`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: fullPrompt }],
      },
    ],
  });

  const text = result.response.text();

  const match = text.match(/```html([\s\S]*?)```/i);
  if (!match) {
    throw new Error("Gemini did not return valid HTML");
  }

  const message =
    text.split("```")[0]?.trim() || "HTML updated successfully";

  return {
    html: match[1].trim(),
    message,
  };
}
