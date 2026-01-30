import { IncomingMessage, ServerResponse } from "http";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type Req = IncomingMessage & { method?: string; url?: string };
type Res = ServerResponse;

const send = (res: ServerResponse, code: number, payload: any, contentType = "application/json") => {
    res.statusCode = code;
    res.setHeader("Content-Type", contentType);
    if (contentType === "application/json") {
        res.end(JSON.stringify(payload));
    } else {
        res.end(payload);
    }
};

const DEFAULT_FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23ddd'/%3E%3Ctext x='8' y='12' font-size='12' text-anchor='middle' fill='%23999'%3E?%3C/text%3E%3C/svg%3E";

async function fetchFaviconAsDataUri(url: string): Promise<string> {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        // Try multiple favicon locations
        const faviconUrls = [
            `${urlObj.origin}/favicon.ico`,
            `${urlObj.origin}/favicon.png`,
            `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
        ];

        for (const faviconUrl of faviconUrls) {
            try {
                const response = await fetch(faviconUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(5000)
                });

                if (response.ok) {
                    const buffer = await response.arrayBuffer();
                    const base64 = Buffer.from(buffer).toString('base64');
                    const contentType = response.headers.get('content-type') || 'image/x-icon';
                    return `data:${contentType};base64,${base64}`;
                }
            } catch (err) {
                // Try next URL
                continue;
            }
        }

        return DEFAULT_FAVICON;
    } catch (err) {
        console.error('Error fetching favicon:', err);
        return DEFAULT_FAVICON;
    }
}

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

    try {
        const urlParam = new URL(req.url || "", `http://${req.headers.host}`).searchParams.get("url");

        if (!urlParam) {
            return send(res, 400, { error: "Missing url parameter" });
        }

        const domain = new URL(urlParam).hostname;

        // Check cache
        const cached = await prisma.favicon.findUnique({
            where: { domain }
        });

        const now = new Date();

        // Return cached if valid
        if (cached && cached.expiresAt > now) {
            res.setHeader("Cache-Control", "public, max-age=604800"); // 7 days
            res.setHeader("X-Favicon-Cache", "HIT");
            return send(res, 200, cached.dataUri, "text/plain");
        }

        // Fetch new favicon
        const dataUri = await fetchFaviconAsDataUri(urlParam);
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Store in cache
        await prisma.favicon.upsert({
            where: { domain },
            create: {
                domain,
                dataUri,
                expiresAt
            },
            update: {
                dataUri,
                expiresAt
            }
        });

        res.setHeader("Cache-Control", "public, max-age=604800");
        res.setHeader("X-Favicon-Cache", "MISS");
        return send(res, 200, dataUri, "text/plain");

    } catch (err: any) {
        console.error("Favicon API error:", err);
        // Return default favicon on error
        res.setHeader("Cache-Control", "no-cache");
        return send(res, 200, DEFAULT_FAVICON, "text/plain");
    }
}
