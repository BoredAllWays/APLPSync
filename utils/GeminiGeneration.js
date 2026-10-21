const { GoogleGenAI } = require('@google/genai');

class GeminiGeneration {
  static async generateRecap(rawText) {
    if (!rawText || rawText.trim() === '') {
      throw new Error('Cannot generate recap: Provided raw text is empty.');
    }

    const ai = new GoogleGenAI({});

    const systemInstruction = `You are an automated Discord sync engine. Your sole job is to transform raw meeting minutes into a highly structured Discord recap.
CRITICAL RULES:
- Never include conversational meta-text (e.g., "Here is your summary:") or markdown blocks like \`\`\`.
- Group everything into two main uppercase sections: SUMMARY: and ACTION ITEMS:.
- Use the exact symbols: '🔹' for summary headers, and topic-specific emojis ('💻' for Software, '⚙️' for Hardware, '📊' for Data Analysis) for actionable headers.
- Every single sub-bullet MUST start with the specific unicode arrow '↳ ' followed by a space.
- Individual assignments must end with an em-dash and italics name, like this: " — _Name_".`;

    const prompt = `Please analyze the following raw meeting notes and organize them perfectly matching the required blueprint. Ensure the recap strictly stays under Discord's 2000 character limit. Be concise.

RAW MEETING NOTES:
${rawText}

---
BLUEPRINT TEMPLATE:
**DATE:** [Extract Meeting Date]
**ATTENDANCE:** [List of attendees present]

**SUMMARY:**
🔹 __General Updates__
 ↳ [Overall project update or decision]
🔹 __Sub-team Progress__
 ↳ [Major update from Software/Hardware/Data]

**ACTION ITEMS:**
💻 __Software__
 ↳ [Specific Task Name] (Due: [Date]) — _[Name]_

⚙️ __Hardware__
 ↳ [Specific Task Name] (Due: [Date]) — _[Name]_

📊 __Data Analysis__
 ↳ [Specific Task Name] (Due: [Date]) — _[Name]_`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1
      }
    });

    return response.text;
  }
}

module.exports = GeminiGeneration;
