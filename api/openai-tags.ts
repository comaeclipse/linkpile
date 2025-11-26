import { execFile } from "child_process";
import type { IncomingMessage, ServerResponse } from "http";
import OpenAI from "openai";

type Req = IncomingMessage & { method?: string; url?: string };
type Res = ServerResponse;

type AnalyzeRequest = {
  url?: string;
  title?: string;
};

type TagResult = {
  tags: string[];
  rationale?: string;
  title?: string;
  url?: string;
};

const send = (res: Res, code: number, payload: any) => {
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

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isDangerousUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    return (
      hostname === "localhost" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("172.17.") ||
      hostname.startsWith("172.18.") ||
      hostname.startsWith("172.19.") ||
      hostname.startsWith("172.20.") ||
      hostname.startsWith("172.21.") ||
      hostname.startsWith("172.22.") ||
      hostname.startsWith("172.23.") ||
      hostname.startsWith("172.24.") ||
      hostname.startsWith("172.25.") ||
      hostname.startsWith("172.26.") ||
      hostname.startsWith("172.27.") ||
      hostname.startsWith("172.28.") ||
      hostname.startsWith("172.29.") ||
      hostname.startsWith("172.30.") ||
      hostname.startsWith("172.31.") ||
      hostname.startsWith("127.") ||
      hostname.endsWith(".local") ||
      hostname === "0.0.0.0"
    );
  } catch {
    return true;
  }
};

const fetchViaCurl = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const args = [
      "-L",
      "-sS",
      "--max-time",
      "15",
      "--connect-timeout",
      "5",
      "--max-filesize",
      "500000",
      "-A",
      "Mozilla/5.0 (LinkPile Tagger)",
      "-H",
      "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      url,
    ];

    const child = execFile("curl", args, { encoding: "utf8", maxBuffer: 600_000 }, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) console.warn("curl stderr:", stderr);
      if (!stdout?.trim()) return reject(new Error("curl returned empty response"));
      resolve(stdout);
    });
    child.on("error", reject);
  });
};

const fetchPage = async (url: string): Promise<string> => {
  try {
    const html = await fetchViaCurl(url);
    if (html) return html;
  } catch (err) {
    console.warn("curl fetch failed, falling back to fetch():", err instanceof Error ? err.message : err);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(url, {
    signal: controller.signal,
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (LinkPile Tagger)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new Error(`URL does not return HTML content (content-type: ${contentType})`);
  }

  return response.text();
};

const extractContent = (html: string): { title: string; textSample: string } => {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const title = (ogTitleMatch?.[1] || titleMatch?.[1] || "").trim();

  const stripped = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const textSample = stripped.slice(0, 6000);
  return { title, textSample };
};

const tagContent = async (input: { content: string; title: string; url: string }): Promise<TagResult> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate tags");
  }

  const openai = new OpenAI({ apiKey });

  const prompt = [
    "You are a concise tagging assistant in the style of old del.icio.us bookmarks.",
    "Given a page title, URL, and short body text, return 3-6 simple tags, each 1-2 lowercase words (no punctuation).",
    "Focus on high-level topics and intent, not full sentences. Respond as JSON with keys: tags (array of strings) and rationale (one sentence).",
  ].join(" ");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Title: ${input.title}\nURL: ${input.url}\nContent: ${input.content}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(raw) as TagResult;
  parsed.tags = parsed.tags
    .map((t) => (t || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim())
    .filter(Boolean)
    .slice(0, 6);

  return parsed;
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

  const body = await parseBody<AnalyzeRequest>(req);
  const targetUrl = body?.url?.trim();
  const providedTitle = body?.title?.trim() || "";

  if (!targetUrl) return send(res, 400, { error: "Missing 'url' field" });
  if (!isValidUrl(targetUrl)) return send(res, 400, { error: "Invalid URL format" });
  if (isDangerousUrl(targetUrl)) return send(res, 403, { error: "Access to this URL is not allowed (SSRF protection)" });

  try {
    const html = await fetchPage(targetUrl);
    const { title: scrapedTitle, textSample } = extractContent(html);
    const title = providedTitle || scrapedTitle || "Untitled";

    const tagging = await tagContent({
      content: textSample,
      title,
      url: targetUrl,
    });

    return send(res, 200, {
      url: targetUrl,
      title,
      tags: tagging.tags,
      rationale: tagging.rationale,
    });
  } catch (err: any) {
    console.error("OpenAI tagging error", err);

    return send(res, 500, {
      error: "Failed to generate tags",
      message: process.env.NODE_ENV !== "production" ? err?.message : undefined,
    });
  }
}
