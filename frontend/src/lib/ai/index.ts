import { getAISuggestions } from './openrouter';

export const getStructureSuggestions = async (
  userGoal: string
): Promise<string> => {
  const prompt = `
    The user wants to create an organizational structure to manage: "${userGoal}"
    \n    As a specialist in life and goal management, propose a logical hierarchy that includes:
    \n    Requirements:
    - 3 to 5 interrelated levels
    - Clear, concise English labels for each level
    - Focus on the hierarchy only (no explanations)
    \n    Response format: Return ONLY valid JSON. No extra text, comments, or code fences.
    \n    Expected keys: { "templateName" (optional), "name" (optional), "levels": ["..."] }.
    \n    Use double quotes only (""), and do not add trailing commas.`;
  const suggestion = await getAISuggestions(prompt);
  return suggestion || 'لم أتمكن من توليد اقتراح حالياً.';
};
