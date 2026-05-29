import Bull from "bull";
import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const emailQueue = new Bull("email", {
  createClient: () => client,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const orderQueue = new Bull("order", {
  createClient: () => client,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  },
});

export const imageQueue = new Bull("image", {
  createClient: () => client,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 5000 },
  },
});

export interface EmailJobData {
  to: string;
  subject: string;
  template: "order-confirmation" | "order-shipped" | "welcome" | "reset-password";
  data: Record<string, unknown>;
}

export interface OrderJobData {
  orderId: string;
  action: "confirm" | "ship" | "deliver" | "cancel";
}

export interface ImageJobData {
  productId: string;
  imageUrl: string;
  publicId: string;
}
