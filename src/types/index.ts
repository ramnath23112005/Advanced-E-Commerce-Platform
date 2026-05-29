import type { User } from "next-auth";

export type { Session } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: User & {
      id: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  basePrice: number;
  salePrice: number | null;
  currency: string;
  sku: string;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  totalStock: number;
  categories: { category: { id: string; name: string; slug: string } }[];
  images: { id: string; url: string; altText: string | null; isPrimary: boolean }[];
  variants: { id: string; name: string; price: number | null; stock: number }[];
  createdAt: string;
}

export interface CartItemWithProduct {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice: number | null;
    totalStock: number;
    images: { url: string; altText: string | null }[];
  };
  variant: { id: string; name: string; price: number | null; stock: number } | null;
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  paymentStatus: string;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
  items: {
    id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    totalPrice: number;
    imageUrl: string | null;
  }[];
  statusHistory: { status: string; createdAt: string; note: string | null }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating" | "popular";
  page?: number;
  limit?: number;
  rating?: number;
}

export interface ReviewWithUser {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  user: { name: string | null; image: string | null };
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockItems: number;
  revenueToday: number;
  ordersToday: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; revenue: number; unitsSold: number }[];
  orderStatusDistribution: { status: string; count: number }[];
}
