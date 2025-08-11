import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateTop10List = async (category) => {
  try {
    const prompt = `Give me a ranked list of the top 10 ${category}, from #1 to #10, without any extra commentary. Output each item on a new line in plain text format.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that only returns lists in plain text format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const text = response.choices[0].message?.content || "";
    const list = text
      .split("\n")
      .map(item => item.replace(/^\d+\.?\s*/, "").trim())
      .filter(Boolean);

    return list.slice(0, 10);
  } catch (error) {
    console.error("Error generating top 10 list:", error);
    
    // Fallback mock data for development
    const mockData = {
      "richest people": ["Elon Musk", "Bernard Arnault", "Jeff Bezos", "Bill Gates", "Warren Buffett", "Larry Page", "Sergey Brin", "Larry Ellison", "Steve Ballmer", "Michael Bloomberg"],
      "popular fruits": ["Apple", "Banana", "Orange", "Strawberry", "Grape", "Mango", "Pineapple", "Watermelon", "Cherry", "Peach"],
      "largest countries": ["Russia", "Canada", "United States", "China", "Brazil", "Australia", "India", "Argentina", "Kazakhstan", "Algeria"]
    };

    const categoryKey = Object.keys(mockData).find(key => 
      category.toLowerCase().includes(key)
    );

    if (categoryKey) {
      return mockData[categoryKey];
    }

    return Array.from({ length: 10 }, (_, i) => `Item ${i + 1} for ${category}`);
  }
};