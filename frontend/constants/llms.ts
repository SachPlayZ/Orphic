import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { SystemMessagePromptTemplate } from "@langchain/core/prompts";


const BEYOND_API_URL = process.env.BEYOND_BASE_URL + "/api/chat/completions";

export const LLM = new ChatGroq({
    model: "llama-3.1-70b-versatile",
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: process.env.GROQ_API_KEY,
});

export const generateResponse = async (
    query: string,
    model: string = "llama-3.1-70b-versatile",
    systemPrompt?: string,
    context?: { role: string; content: string }[]
): Promise<string> => {
    const messages: { role: string; content: string }[] = [];

    if (context) {
        messages.push(...context);
    }

    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: query });
    const prompt = ChatPromptTemplate.fromMessages(
        messages.map((msg) => {
            if (msg.role === "system") {
                return SystemMessagePromptTemplate.fromTemplate(msg.content);
            } else {
                return HumanMessagePromptTemplate.fromTemplate(msg.content);
            }
        })
    );

    const chain = prompt.pipe(LLM);
    const response = await chain.invoke({})
    return JSON.stringify(response);
};

export const generate = async (
    query: string,
    model: string = "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
    systemPrompt?: string,
    context?: { role: string; content: string }[]
): Promise<string> => {
    const messages: { role: string; content: string }[] = [];

    if (context) {
        messages.push(...context);
    }

    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: query });
    const body = {
        "model": model,
        "messages": messages,
    };
    const response = await fetch(BEYOND_API_URL, {
        method: "POST",
        headers: new Headers([
            ["x-api-key", process.env.BEYOND_API_KEY || ""],
            ["Content-Type", "application/json"],
        ]),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Beyond API error: ${response.statusText}`);
    }
    const res = await response.json();
    return JSON.stringify(res.choices[0].message.content);
}


// (async () => {
//     const response = await generate("Who are you?");
//     console.log(response);
// })();