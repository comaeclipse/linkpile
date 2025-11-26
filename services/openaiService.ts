import { SuggestionResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "";

/**
 * Suggests tags for a bookmark using OpenAI (via backend)
 */
export const suggestTagsOpenAI = async (
  url: string,
  title: string
): Promise<SuggestionResponse & { rationale?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/api/openai-tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("OpenAI suggestion failed:", error);
    return { tags: [] };
  }
};
