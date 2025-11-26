import { IncomingMessage, ServerResponse } from "http";
import { prisma } from "../services/prismaClient";

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    // Simple query to test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "connected", database: "postgresql" }));
  } catch (error) {
    console.error("Health check failed:", error);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "disconnected", error: "Database unavailable" }));
  }
}

