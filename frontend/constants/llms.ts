import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { SystemMessagePromptTemplate } from "@langchain/core/prompts";



export const LLM = new ChatGroq({
    model: "llama-3.1-8b-instant",
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

(async () => {
    const response = await generateResponse("Who are you?");
    console.log(response);
})();