import { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI, Type } from "@google/genai";

interface RequestBody {
  action: 'suggest-tags' | 'generate-headlines';
  url?: string;
  title?: string;
  userDescription?: string;
}

interface PageData {
  title: string;
  metaDescription: string;
  content: string;
}

type Req = IncomingMessage & { method?: string; url?: string };
type Res = ServerResponse;

const send = (res: ServerResponse, code: number, payload: any) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const parseBody = async <T>(req: IncomingMessage): Promise<T | null> => {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? (JSON.parse(raw) as T) : null);
      } catch (err) {
        console.error("Failed to parse body", err);
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
};

/**
 * Fetches webpage content for AI analysis
 */
const fetchPageContent = async (targetUrl: string): Promise<PageData | null> => {
  if (!targetUrl) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPileBot/1.0)',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;

    const html = await response.text();

    // Extract metadata
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

    // Clean body text
    let cleanContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 15000);

    return {
      title: (ogTitleMatch?.[1] || titleMatch?.[1] || '').trim(),
      metaDescription: (ogDescMatch?.[1] || descMatch?.[1] || '').trim(),
      content: cleanContent,
    };
  } catch (error) {
    console.warn('Failed to fetch page content:', error);
    return null;
  }
};

export default async function handler(req: Req, res: Res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    return send(res, 405, { error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not configured");
    return send(res, 500, { error: "AI service not configured" });
  }

  try {
    const body = await parseBody<RequestBody>(req);

    if (!body || !body.action) {
      return send(res, 400, { error: "Missing required fields" });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Action: Suggest Tags and Description
    if (body.action === 'suggest-tags') {
      const { url, title, userDescription } = body;

      // Fetch page content if URL provided
      let pageData: PageData | null = null;
      if (url && url.startsWith('http')) {
        pageData = await fetchPageContent(url);
      }

      const prompt = `
You are a bookmarking assistant. Your job is to strictly categorize a webpage based on its ACTUAL content.

INPUT DATA:
- User URL: ${url || 'N/A'}
- User Title: ${title || 'N/A'}
- Scraped Title: ${pageData?.title || 'N/A'}
- Scraped Meta Description: ${pageData?.metaDescription || 'N/A'}
- Scraped Body Content (Truncated):
"""
${pageData?.content || 'CONTENT_UNAVAILABLE'}
"""

INSTRUCTIONS:
1. TAGS: Generate 5-7 lowercase, single-word tags.
   - Prioritize technical specificity (e.g., use 'postgres' instead of 'database').
   - If content is available, extract keywords from it.

2. DESCRIPTION:
   - If the 'Scraped Meta Description' is available and good, USE IT (or a slightly shortened version).
   - If 'Scraped Body Content' is available, summarize it in 1 sentence.
   - CRITICAL: If 'CONTENT_UNAVAILABLE', DO NOT HALLUCINATE. Return an EMPTY STRING for the description.

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

      const result = response.text ? JSON.parse(response.text) : { tags: [] };
      return send(res, 200, result);
    }

    // Action: Generate Ticker Headlines
    if (body.action === 'generate-headlines') {
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

      const result = response.text ? JSON.parse(response.text) : ["Weather: Sunny", "Hay: Stable"];
      return send(res, 200, result);
    }

    return send(res, 400, { error: "Invalid action" });

  } catch (err: any) {
    console.error("Gemini API error", err);
    return send(res, 500, {
      error: "AI service error",
      message: process.env.NODE_ENV !== "production" ? err?.message : undefined
    });
  }
}
