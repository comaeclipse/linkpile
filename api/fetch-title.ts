import { IncomingMessage, ServerResponse } from "http";

type Req = IncomingMessage & { method?: string; url?: string };
type Res = ServerResponse;

const send = (res: ServerResponse, code: number, payload: any) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isDangerousUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Block internal/private networks (SSRF prevention)
    if (
      hostname === 'localhost' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.startsWith('127.') ||
      hostname.endsWith('.local') ||
      hostname === '0.0.0.0'
    ) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
};

export default async function handler(req: Req, res: Res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    return send(res, 405, { error: "Method not allowed" });
  }

  const targetUrl = new URL(req.url || "", "http://localhost").searchParams.get("url");

  if (!targetUrl) {
    return send(res, 400, { error: "Missing 'url' parameter" });
  }

  if (!isValidUrl(targetUrl)) {
    return send(res, 400, { error: "Invalid URL format" });
  }

  if (isDangerousUrl(targetUrl)) {
    return send(res, 403, { error: "Access to this URL is not allowed (SSRF protection)" });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPileBot/1.0; +https://github.com/comaeclipse/linkpile)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return send(res, response.status, {
        error: "Failed to fetch URL",
        status: response.status,
        statusText: response.statusText
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return send(res, 400, {
        error: "URL does not return HTML content",
        contentType
      });
    }

    // Read response body with size limit (5MB)
    const reader = response.body?.getReader();
    if (!reader) {
      return send(res, 500, { error: "Failed to read response" });
    }

    let html = '';
    let totalSize = 0;
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > maxSize) {
        reader.cancel();
        return send(res, 413, { error: "Response too large" });
      }

      html += new TextDecoder().decode(value);

      // Early exit if we found the title in the head section
      if (html.includes('</head>')) {
        reader.cancel();
        break;
      }
    }

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);

    const title = (ogTitleMatch?.[1] || titleMatch?.[1] || '').trim();

    if (!title) {
      return send(res, 200, {
        title: '',
        message: 'No title found'
      });
    }

    return send(res, 200, { title });

  } catch (err: any) {
    console.error("Fetch title error", err);

    if (err.name === 'AbortError') {
      return send(res, 504, { error: "Request timeout after 10 seconds" });
    }

    return send(res, 500, {
      error: "Failed to fetch page title",
      message: process.env.NODE_ENV !== "production" ? err?.message : undefined
    });
  }
}
