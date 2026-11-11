import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.SUPERADMIN_PASSWORD) {
    throw new Error("SUPERADMIN_PASSWORD doit être défini en production.");
  }

  const email = process.env.SUPERADMIN_EMAIL ?? "admin@wisecom.cm";
  const password = process.env.SUPERADMIN_PASSWORD || "ChangeMoiRapidement!123";

  const superadmin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      firstName: process.env.SUPERADMIN_FIRSTNAME ?? "Admin",
      lastName: process.env.SUPERADMIN_LASTNAME ?? "Principal",
      role: "SUPERADMIN",
    },
  });
  console.log(`Super-admin prêt : ${superadmin.email}`);

  const categories = [
    { name: "Ordinateurs", nameEn: "Computers", slug: "ordinateurs", icon: "laptop" },
    { name: "Téléphones", nameEn: "Phones", slug: "telephones", icon: "smartphone" },
    { name: "Ustensiles de cuisine", nameEn: "Kitchenware", slug: "cuisine", icon: "utensils" },
    { name: "Clés USB & Stockage", nameEn: "USB & Storage", slug: "stockage", icon: "usb" },
    { name: "Chargeurs & Câbles", nameEn: "Chargers & Cables", slug: "chargeurs", icon: "plug" },
    { name: "Accessoires", nameEn: "Accessories", slug: "accessoires", icon: "headphones" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log(`${categories.length} catégories prêtes.`);

  const laptopCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "ordinateurs" } });
  const phoneCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "telephones" } });

  const sampleProducts = [
    {
      name: "MacBook Air M1 13\" (Occasion, Grade A)",
      nameEn: 'MacBook Air M1 13" (Used, Grade A)',
      slug: "macbook-air-m1-13-occasion",
      description: "MacBook Air M1, 8 Go RAM, 256 Go SSD. Excellent état, batterie à 92%.",
      descriptionEn: "MacBook Air M1, 8GB RAM, 256GB SSD. Excellent condition, 92% battery health.",
      price: 380000,
      compareAtPrice: 430000,
      quantity: 3,
      condition: "OCCASION" as const,
      brand: "Apple",
      images: [],
      isFeatured: true,
      categoryId: laptopCategory.id,
    },
    {
      name: "iPhone 12 64 Go (Occasion, Débloqué)",
      nameEn: "iPhone 12 64GB (Used, Unlocked)",
      slug: "iphone-12-64go-occasion",
      description: "iPhone 12 débloqué tout opérateur, très bon état, batterie à 88%.",
      descriptionEn: "Unlocked iPhone 12, very good condition, 88% battery health.",
      price: 195000,
      compareAtPrice: 230000,
      quantity: 5,
      condition: "OCCASION" as const,
      brand: "Apple",
      images: [],
      isFeatured: true,
      categoryId: phoneCategory.id,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.upsert({ where: { slug: product.slug }, update: product, create: product });
  }
  console.log(`${sampleProducts.length} produits d'exemple prêts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
