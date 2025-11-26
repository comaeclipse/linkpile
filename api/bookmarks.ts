import { IncomingMessage, ServerResponse } from "http";
import { PrismaClient } from "@prisma/client";

// Inline Prisma client for Vercel serverless functions
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  createdAt?: number;
  isRead?: boolean;
}

type Req = IncomingMessage & { method?: string; url?: string };
type Res = ServerResponse & { status?: (code: number) => Res };

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

export default async function handler(req: Req, res: Res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  const method = req.method || "GET";
  const id = new URL(req.url || "", "http://localhost").searchParams.get("id");

  try {
    if (method === "GET") {
      const rows = await prisma.bookmark.findMany({
        orderBy: { createdAt: "desc" },
      });
      return send(res, 200, rows);
    }

    if (method === "POST") {
      const body = await parseBody<Bookmark>(req);
      if (!body || !body.url || !body.title) {
        return send(res, 400, { error: "Missing required fields" });
      }

      const created = await prisma.bookmark.create({
        data: {
          id: body.id,
          url: body.url,
          title: body.title,
          description: body.description ?? "",
          tags: body.tags ?? [],
          createdAt: body.createdAt
            ? new Date(body.createdAt)
            : new Date(Date.now()),
          isRead: !!body.isRead,
        },
      });
      return send(res, 201, created);
    }

    if (method === "PATCH" || method === "PUT") {
      if (!id) return send(res, 400, { error: "Missing id" });
      const body = await parseBody<Partial<Bookmark>>(req);
      const updated = await prisma.bookmark.update({
        where: { id },
        data: {
          isRead: body?.isRead,
          title: body?.title,
          description: body?.description,
          tags: body?.tags,
        },
      });
      return send(res, 200, updated);
    }

    if (method === "DELETE") {
      if (!id) return send(res, 400, { error: "Missing id" });
      await prisma.bookmark.delete({ where: { id } });
      return send(res, 204, {});
    }

    return send(res, 405, { error: "Method not allowed" });
  } catch (err: any) {
    console.error("API error", err);
    return send(res, 500, { 
      error: "Internal Server Error", 
      message: err?.message || String(err),
      stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined
    });
  }
}
