import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient(apiKey?: string): GoogleGenerativeAI {
    const key = apiKey || process.env.GEMINI_API_KEY || "";
    if (!key) {
        throw new Error("Gemini API key is required. Please provide it as a parameter or set GEMINI_API_KEY environment variable.");
    }
    return new GoogleGenerativeAI(key);
}

export async function generateHtmlWithGemini(
    prompt: string, 
    name: string, 
    apiKey?: string
): Promise<string> {
    try {
        const genAI = getGeminiClient(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const fullPrompt = `
You're an expert web developer. Generate clean, production-ready HTML code for a single-page website. The website is titled "${name}". The theme or idea is: "${prompt}". Return only valid HTML. Do not include JavaScript or external CSS unless absolutely necessary.
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

export async function editHtmlWithGemini(
  existingHtml: string,
  editPrompt: string,
  name: string,
  apiKey?: string
): Promise<{ html: string; message: string }> {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const fullPrompt = `
You're an expert web developer. Here is the current HTML for a website titled "${name}":

${existingHtml}

User request: "${editPrompt}"

Please respond in this format:
1. First, provide a brief, friendly confirmation message (1-2 sentences) explaining what changes you made
2. Then provide the complete updated HTML code

Make sure to:
- Implement the requested changes accurately
- Maintain the existing structure and functionality
- Keep the code clean and production-ready
- Don't include unnecessary JavaScript or external CSS

Your response should be conversational and helpful, like a skilled developer teammate.
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();

    // Extract the confirmation message and HTML
    let message = "I've successfully made the requested changes to your website!";
    let html = text;

    // Look for HTML start indicators
    const htmlMarkers = ['<!DOCTYPE', '<html', '```html'];
    let htmlStartIndex = -1;

    for (const marker of htmlMarkers) {
      const index = text.indexOf(marker);
      if (index !== -1) {
        htmlStartIndex = index;
        break;
      }
    }

    if (htmlStartIndex > 0) {
      // Extract message before HTML
      const messageText = text.substring(0, htmlStartIndex).trim();
      if (messageText.length > 0) {
        // Clean up the message (remove markdown, extra formatting)
        message = messageText
          .replace(/^#+\s*/gm, '') // Remove markdown headers
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
          .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
          .replace(/`(.*?)`/g, '$1') // Remove inline code formatting
          .trim();
        
        // Take only the first meaningful sentence or two
        const sentences = message.split(/[.!?]+/);
        if (sentences.length > 2) {
          message = sentences.slice(0, 2).join('. ').trim() + '.';
        }
      }
      
      html = text.substring(htmlStartIndex);
    }

    // Remove code block markers if present
    html = html.replace(/^```html\s*|^```\s*|```$/gim, "").trim();

    return {
      html,
      message: message || "I've successfully updated your website with the requested changes!"
    };

  } catch (error) {
    console.error("Gemini edit error:", error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
