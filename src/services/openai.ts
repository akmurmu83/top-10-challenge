import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // 🚨 Only for development; remove in production
});

export const generateTop10List = async (category: string): Promise<string[]> => {
    try {
        const prompt = `Give me a ranked list of the top 10 ${category}, 
    from #1 to #10, without any extra commentary. 
    Output each item on a new line in plain text.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Faster and cheaper
            messages: [
                { role: "system", content: "You are a helpful assistant that only returns lists." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        });

        const text = response.choices[0].message?.content || "";
        const list = text
            .split("\n")
            .map(item => item.replace(/^\d+\.?\s*/, "").trim()) // remove numbering
            .filter(Boolean);

        return list.slice(0, 10);
    } catch (error) {
        console.error("Error generating top 10 list:", error);
        return [];
    }
};
