import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

function getRedisUrl() {
  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.warn("REDIS_URL not set — caching disabled");
      return null;
    }
    return "redis://localhost:6379";
  }
  return url;
}

const redisUrl = getRedisUrl();

export const redis =
  redisUrl
    ? globalForRedis.redis ??
      new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 50, 2000),
        enableOfflineQueue: true,
        lazyConnect: true,
      })
    : null;

if (redis && process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export const CACHE_TTL = {
  PRODUCT: 300,
  CATEGORY: 600,
  USER_SESSION: 900,
  PAGE: 60,
} as const;

export const CACHE_KEYS = {
  product: (id: string) => `product:${id}`,
  products: (filters: string) => `products:${filters}`,
  category: (slug: string) => `category:${slug}`,
  cart: (userId: string) => `cart:${userId}`,
  wishlist: (userId: string) => `wishlist:${userId}`,
  user: (id: string) => `user:${id}`,
  featured: "products:featured",
  topRated: "products:top-rated",
} as const;
