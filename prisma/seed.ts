import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@luxe.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@luxe.com",
      hashedPassword,
      role: "ADMIN",
    },
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Clothing", slug: "clothing", description: "Apparel and fashion" } }),
    prisma.category.create({ data: { name: "Accessories", slug: "accessories", description: "Bags, watches, and more" } }),
    prisma.category.create({ data: { name: "Electronics", slug: "electronics", description: "Gadgets and devices" } }),
    prisma.category.create({ data: { name: "Home", slug: "home", description: "Home and living" } }),
    prisma.category.create({ data: { name: "Beauty", slug: "beauty", description: "Skincare and cosmetics" } }),
    prisma.category.create({ data: { name: "Sale", slug: "sale", description: "Discounted items" }, parentId: undefined }),
  ]);

  const coupon = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 50,
      maxDiscount: 100,
      isActive: true,
    },
  });

  console.log("Seed complete:", { admin: admin.email, categories: categories.length, coupon: coupon.code });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
