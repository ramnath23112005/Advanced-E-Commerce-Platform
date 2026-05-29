import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "CAPTURED",
            paymentIntentId: paymentIntent.id,
            statusHistory: { create: { status: "CONFIRMED", note: "Payment captured" } },
          },
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const failedIntent = event.data.object;
        const failedOrderId = failedIntent.metadata.orderId;

        await prisma.order.update({
          where: { id: failedOrderId },
          data: {
            paymentStatus: "FAILED",
            statusHistory: { create: { status: "PENDING", note: "Payment failed" } },
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
