// Mock OpenAI service for demonstration
// In production, you would implement actual OpenAI API calls
export const generateTop10List = async (category: string): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock responses for common categories
  const mockData: Record<string, string[]> = {
    "richest people": [
      "Elon Musk", "Bernard Arnault", "Jeff Bezos", "Bill Gates", "Warren Buffett",
      "Larry Page", "Sergey Brin", "Larry Ellison", "Steve Ballmer", "Michael Bloomberg"
    ],
    "popular fruits": [
      "Apple", "Banana", "Orange", "Strawberry", "Grape",
      "Mango", "Pineapple", "Watermelon", "Cherry", "Peach"
    ],
    "largest countries": [
      "Russia", "Canada", "United States", "China", "Brazil",
      "Australia", "India", "Argentina", "Kazakhstan", "Algeria"
    ],
    "most popular programming languages": [
      "JavaScript", "Python", "Java", "TypeScript", "C#",
      "C++", "PHP", "Shell", "C", "Ruby"
    ]
  };

  // Find matching category or generate generic list
  const categoryKey = Object.keys(mockData).find(key => 
    category.toLowerCase().includes(key)
  );

  if (categoryKey) {
    return mockData[categoryKey];
  }

  // Generate a generic numbered list for unknown categories
  return Array.from({ length: 10 }, (_, i) => `Item ${i + 1} for ${category}`);
};