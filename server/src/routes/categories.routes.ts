import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json({ categories });
});

const categorySchema = z.object({
  name: z.string().min(2),
  nameEn: z.string().min(2).optional(),
  slug: z.string().min(2),
  icon: z.string().optional(),
  description: z.string().optional(),
});

categoriesRouter.post("/", authenticate, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });
  const category = await prisma.category.create({ data: parsed.data });
  res.status(201).json({ category });
});

categoriesRouter.patch("/:id", authenticate, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });
  const category = await prisma.category.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ category });
});

categoriesRouter.delete("/:id", authenticate, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
