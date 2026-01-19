
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateAIResponse(message: string) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("[AI] OPENAI_API_KEY not found in environment");
        return "Please configure OPENAI_API_KEY in .env to chat with me!";
    }

    try {
        console.log("[AI] Calling OpenAI API...");
        const { text } = await generateText({
            model: openai("gpt-4o"),
            system: "You are Ikem Ai, a helpful assistant in a chat application. You are concise, friendly, and helpful.",
            prompt: message,
        });
        console.log("[AI] OpenAI response received successfully");
        return text;
    } catch (e) {
        console.error("[AI] OpenAI API Error:", e);
        return "I am experiencing some technical difficulties.";
    }
}
