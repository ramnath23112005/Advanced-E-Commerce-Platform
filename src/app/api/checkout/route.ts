import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { shippingAddressId, couponCode, notes } = checkoutSchema.parse(body);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: { select: { id: true, name: true, slug: true, basePrice: true, salePrice: true, sku: true, totalStock: true, images: { where: { isPrimary: true }, take: 1 } } },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const shippingAddress = await prisma.address.findFirst({
      where: { id: shippingAddressId, userId: session.user.id },
    });

    if (!shippingAddress) {
      return NextResponse.json({ error: "Invalid shipping address" }, { status: 400 });
    }

    let subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.basePrice;
      return sum + Number(price) * item.quantity;
    }, 0);

    let discountAmount = 0;
    let appliedCouponId: string | undefined;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date()) && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        if (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount)) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = Math.min(subtotal * (Number(coupon.discountValue) / 100), Number(coupon.maxDiscount) || Infinity);
          } else if (coupon.discountType === "FIXED_AMOUNT") {
            discountAmount = Number(coupon.discountValue);
          }
          appliedCouponId = coupon.id;
        }
      }
    }

    const shippingCost = subtotal >= 100 ? 0 : 9.99;
    const taxRate = 0.08;
    const taxAmount = (subtotal - discountAmount) * taxRate;
    const total = subtotal - discountAmount + shippingCost + taxAmount;

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount,
        total,
        shippingAddressId: shippingAddress.id,
        couponId: appliedCouponId,
        notes,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.product.name,
            sku: item.product.sku,
            price: Number(item.product.salePrice || item.product.basePrice),
            quantity: item.quantity,
            totalPrice: Number(item.product.salePrice || item.product.basePrice) * item.quantity,
            imageUrl: item.product.images[0]?.url || null,
          })),
        },
        statusHistory: {
          create: { status: "PENDING", note: "Order placed" },
        },
      },
    });

    if (appliedCouponId) {
      await prisma.coupon.update({
        where: { id: appliedCouponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(total) * 100),
      currency: "usd",
      metadata: { orderId: order.id, orderNumber },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid input" }, { status: 422 });
    }
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
