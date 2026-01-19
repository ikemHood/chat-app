
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { env } from "@/env";

export async function generateAIResponse(message: string) {
    if (env.OPENAI_API_KEY) {
        return "Please configure OPENAI_API_KEY in .env to chat with me!";
    }

    try {
        const { text } = await generateText({
            model: openai("gpt-4o"),
            system: "You are Ikem Ai, a helpful assistant in a chat application. You are concise, friendly, and helpful.",
            prompt: message,
        });
        return text;
    } catch (e) {
        console.error("AI Error", e);
        return "I am experiencing some technical difficulties.";
    }
}
