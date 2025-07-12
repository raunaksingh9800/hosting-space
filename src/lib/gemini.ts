import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateHtmlWithGemini(prompt: string, name: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const fullPrompt = `
You're an expert web developer. Generate clean, production-ready HTML code for a single-page website.
The website is titled "${name}". The theme or idea is: "${prompt}".
Return only valid HTML. Do not include JavaScript or external CSS unless absolutely necessary.
`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text();

        // Remove html code block markers if present
        text = text.replace(/^```html\s*|^```\s*|```$/gim, "").trim();

        return text;
    } catch (error) {
        console.error("Gemini generation error:", error);
        throw new Error("Gemini API error");
    }
}

export async function editHtmlWithGemini(existingHtml: string, editPrompt: string, name: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const fullPrompt = `
You're an expert web developer. Here is the current HTML for a website titled "${name}":

${existingHtml}

Please make the following changes: "${editPrompt}"

Return only the updated, valid HTML. Do not include JavaScript or external CSS unless absolutely necessary.
`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text();

        // Remove html code block markers if present
        text = text.replace(/^```html\s*|^```\s*|```$/gim, "").trim();

        return text;
    } catch (error) {
        console.error("Gemini edit error:", error);
        throw new Error("Gemini API error");
    }
}
