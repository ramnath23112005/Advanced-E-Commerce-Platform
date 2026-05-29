import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
  const checks = {
    ok: true,
    timestamp: new Date().toISOString(),
    services: {} as Record<string, string>,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = "connected";
  } catch {
    checks.ok = false;
    checks.services.database = "disconnected";
  }

  if (redis) {
    try {
      await redis.ping();
      checks.services.redis = "connected";
    } catch {
      checks.ok = false;
      checks.services.redis = "disconnected";
    }
  } else {
    checks.services.redis = "not configured";
  }

  return NextResponse.json(checks, {
    status: checks.ok ? 200 : 503,
  });
}
