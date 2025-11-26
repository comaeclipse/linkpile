import { IncomingMessage, ServerResponse } from "http";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface LayoutPayload {
  tabs: any[];
  widgets: any[];
  positions: Record<string, any>;
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

export default async function handler(req: Req, res: Res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  const method = req.method || "GET";

  try {
    if (method === "GET") {
      // Fetch existing layout or return default
      const layout = await prisma.layout.findUnique({
        where: { id: "global" },
      });

      if (!layout) {
        // Return empty default layout
        return send(res, 200, {
          tabs: [],
          widgets: [],
          positions: {},
        });
      }

      return send(res, 200, {
        tabs: layout.tabs,
        widgets: layout.widgets,
        positions: layout.positions,
      });
    }

    if (method === "PUT") {
      const body = await parseBody<LayoutPayload>(req);

      if (!body) {
        return send(res, 400, { error: "Missing layout data" });
      }

      // Upsert layout (create or update)
      const updated = await prisma.layout.upsert({
        where: { id: "global" },
        create: {
          id: "global",
          tabs: body.tabs || [],
          widgets: body.widgets || [],
          positions: body.positions || {},
        },
        update: {
          tabs: body.tabs || [],
          widgets: body.widgets || [],
          positions: body.positions || {},
        },
      });

      return send(res, 200, {
        tabs: updated.tabs,
        widgets: updated.widgets,
        positions: updated.positions,
      });
    }

    return send(res, 405, { error: "Method not allowed" });
  } catch (err: any) {
    console.error("Layout API error", err);
    return send(res, 500, {
      error: "Internal Server Error",
      message: err?.message || String(err),
      stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined,
    });
  }
}
