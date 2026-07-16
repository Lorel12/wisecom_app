import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

export const productsRouter = Router();

const listQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  condition: z.enum(["NEUF", "OCCASION"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["recent", "price_asc", "price_desc"]).optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(60).default(24),
});

productsRouter.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Paramètres invalides." });
  const { category, search, condition, minPrice, maxPrice, sort, featured, page, perPage } = parsed.data;

  const where = {
    isActive: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(condition ? { condition } : {}),
    ...(featured !== undefined ? { isFeatured: featured } : {}),
    ...(minPrice || maxPrice
      ? { price: { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lte: maxPrice } : {}) } }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { brand: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ items, total, page, perPage, totalPages: Math.ceil(total / perPage) });
});

productsRouter.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true, reviews: { include: { user: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!product || !product.isActive) return res.status(404).json({ error: "Produit introuvable." });
  res.json({ product });
});

const productSchema = z.object({
  name: z.string().min(2),
  nameEn: z.string().min(2).optional(),
  slug: z.string().min(2),
  description: z.string().min(5),
  descriptionEn: z.string().min(5).optional(),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  quantity: z.number().int().min(0),
  condition: z.enum(["NEUF", "OCCASION"]).default("NEUF"),
  brand: z.string().optional(),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string(),
});

productsRouter.post("/", authenticate, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides.", details: parsed.error.flatten() });
  const product = await prisma.product.create({ data: parsed.data });
  res.status(201).json({ product });
});

productsRouter.patch("/:id", authenticate, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });
  const product = await prisma.product.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ product });
});

productsRouter.delete("/:id", authenticate, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(204).send();
});
