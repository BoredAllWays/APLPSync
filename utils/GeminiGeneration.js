const { GoogleGenAI } = require("@google/genai");

class GeminiGeneration {
    static async generateRecap(rawText) {
        if (!rawText || rawText.trim() === "") {
            throw new Error(
                "Cannot generate recap: Provided raw text is empty.",
            );
        }

        const ai = new GoogleGenAI({});

        const systemInstruction = `You are an automated Discord sync engine. Your sole job is to transform raw meeting minutes into a highly structured Discord recap.
CRITICAL RULES:
- Never include conversational meta-text (e.g., "Here is your summary:") or markdown blocks like \`\`\`.
- Group everything into two main uppercase sections: SUMMARY: and ACTIONABLES:.
- Use the exact symbols: '🔹' for summary headers, and topic-specific emojis ('💻', '🌐', '📋', '🔴') for actionable headers.
- Every single sub-bullet MUST start with the specific unicode arrow '↳ ' followed by a space.
- Individual assignments must end with an em-dash and italics name, like this: " — _Name_" or " — _BOTH_".`;

        const prompt = `Please analyze the following raw meeting notes and organize them perfectly matching the required blueprint. Please make sure the recap does not go over 2000 characters (the discord limit). MAKE SURE of this once you have built the recap. If any subsection doesnt have that much info or input you can either remove it or merge it with another subsection. But, only if there isnt that many actionables for that specific section.

RAW MEETING NOTES:
${rawText}

---
BLUEPRINT TEMPLATE:
DATE (In Bold): [Extract Date matching the text format] ([Initials of attendees]) -- There will be 2 dates put both with the respective initials around it.
SUMMARY(in Bold):
🔹 __[Topic Title 1]__
 ↳ [Detail or update 1] ([Name of owner if applicable])
 ↳ [Detail or update 2]

ACTIONABLES (In Bold):
💻 __Testing__
 ↳ [Test Task Description] — _[Name]_

🌐 __Learning / Research (Both)__
 ↳ [Research Topic]

📋 __Individual Tasks__
 ↳ [Specific Task Name] — _[Name]_

🔴 __Priority__
 ↳ [Crucial Pipeline Milestone] — _BOTH_`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.1,
            },
        });

        return response.text;
    }
}

module.exports = GeminiGeneration;
