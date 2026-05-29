import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ items: [] });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            totalStock: true,
            images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
          },
        },
      },
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, variantId, quantity = 1 } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId_variantId: { userId: session.user.id, productId, variantId: variantId || "" } },
    });

    if (existing) {
      const item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
      return NextResponse.json({ item });
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        variantId: variantId || null,
        quantity,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();

    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ deleted: true });
    }

    const item = await prisma.cartItem.update({
      where: { id: itemId, userId: session.user.id },
      data: { quantity },
    });

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await req.json();

    await prisma.cartItem.delete({ where: { id: itemId, userId: session.user.id } });

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
  }
}
