import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.productView.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });

    await prisma.searchQuery.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });

    return NextResponse.json({ ok: true, cleaned: true });
  } catch (error) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
