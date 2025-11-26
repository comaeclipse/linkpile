import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse } from "../types";

const getGeminiApiKey = () => {
  // Prefer Vite-exposed key, but allow process.env for non-browser contexts
  return (
    (typeof import.meta !== "undefined" ? import.meta.env.VITE_GEMINI_API_KEY : undefined) ||
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY
  );
};

const createClient = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

interface PageData {
  title: string;
  metaDescription: string;
  content: string;
}

/**
 * Fetches and parses webpage content.
 * Since we are in a browser, we MUST use a proxy to bypass CORS.
 * In a Node.js/Supabase Edge Function environment, you would use simple 'fetch' or 'axios'.
 */
const fetchPageContent = async (targetUrl: string): Promise<PageData | null> => {
  if (!targetUrl) return null;

  try {
    // Using allorigins.win JSON proxy to act as our "curl"
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for heavier pages

    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    
    const data = await response.json();
    const html = data.contents;

    if (!html) return null;
    
    // Parse HTML in the browser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 1. Extract High-Quality Metadata (The "TL;DR" of the internet)
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const title = doc.title || doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || "";

    // 2. Clean the DOM aggressively to get real content
    const junkSelectors = [
      'script', 'style', 'noscript', 'iframe', 'svg', 
      'nav', 'footer', 'header', 'aside', 
      '.nav', '.footer', '.menu', '.sidebar', '#sidebar', '.ad', '.advertisement'
    ];
    
    junkSelectors.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // 3. Get text and normalize
    const bodyText = doc.body.textContent || "";
    const cleanContent = bodyText.replace(/\s+/g, ' ').trim().slice(0, 15000);
    
    return {
      title: title.trim(),
      metaDescription: (metaDesc || ogDesc || "").trim(),
      content: cleanContent
    };

  } catch (error) {
    console.warn("Scrape failed:", error);
    return null;
  }
};

export const suggestTagsAndDescription = async (
  url: string,
  title: string,
  userDescription: string
): Promise<SuggestionResponse> => {
  const ai = createClient();
  if (!ai) {
    return { tags: [] };
  }

  // Attempt to fetch real content
  let pageData: PageData | null = null;
  if (url && url.startsWith('http')) {
    pageData = await fetchPageContent(url);
  }

  try {
    const prompt = `
      You are a bookmarking assistant. Your job is to strictly categorize a webpage based on its ACTUAL content.
      
      INPUT DATA:
      - User URL: ${url}
      - User Title: ${title}
      - Scraped Title: ${pageData?.title || "N/A"}
      - Scraped Meta Description: ${pageData?.metaDescription || "N/A"}
      - Scraped Body Content (Truncated): 
      """
      ${pageData?.content || "CONTENT_UNAVAILABLE"}
      """

      INSTRUCTIONS:
      1. TAGS: Generate 5-7 lowercase, single-word tags. 
         - Prioritize technical specificity (e.g., use 'postgres' instead of 'database').
         - If content is available, extract keywords from it.
      
      2. DESCRIPTION:
         - If the 'Scraped Meta Description' is available and good, USE IT (or a slightly shortened version).
         - If 'Scraped Body Content' is available, summarize it in 1 sentence.
         - CRITICAL: If 'CONTENT_UNAVAILABLE', DO NOT HALLUCINATE. Do not say "This page likely discusses...". Return an EMPTY STRING for the description if you don't have data.

      OUTPUT FORMAT: JSON
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedDescription: {
              type: Type.STRING,
              nullable: true,
            },
          },
          required: ["tags"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SuggestionResponse;
    }
    return { tags: [] };
  } catch (error) {
    console.error("AI suggestion failed:", error);
    return { tags: [] };
  }
};

export const generateTickerHeadlines = async (): Promise<string[]> => {
  const ai = createClient();
  if (!ai) return ["Weather: Clear skies", "Hay: $5.00/bale", "System: Online"];

  try {
    const prompt = `
      Generate 5 short, punchy, slightly witty ticker headlines for a social bookmarking site.
      Include:
      1. A fictional local weather report.
      2. The current market price of Hay (make it up, but realistic).
      3. A breaking tech news headline (fictional or real-sounding).
      4. A random fun fact.
      5. A community status update.
      
      Keep them very short (max 6 words each). Return as a JSON array of strings.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return ["Weather: Sunny", "Hay Price: Stable"];
  } catch (e) {
    return ["Weather: Cloudy", "Hay: expensive"];
  }
};
