import { SuggestionResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Suggests tags and description for a bookmark using AI (via backend)
 */
export const suggestTagsAndDescription = async (
  url: string,
  title: string,
  userDescription: string
): Promise<SuggestionResponse> => {
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'suggest-tags',
        url,
        title,
        userDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI suggestion failed:", error);
    return { tags: [] };
  }
};

/**
 * Generates witty ticker headlines using AI (via backend)
 */
export const generateTickerHeadlines = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate-headlines',
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ticker generation failed:", error);
    return ["Weather: Sunny", "Hay: Stable", "System: Online"];
  }
};
