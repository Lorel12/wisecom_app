import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

export const reviewsRouter = Router();

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

reviewsRouter.post("/", authenticate, async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId: parsed.data.productId, userId: req.user!.sub } },
    create: { ...parsed.data, userId: req.user!.sub },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
  });
  res.status(201).json({ review });
});

reviewsRouter.delete("/:id", authenticate, async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) return res.status(404).json({ error: "Avis introuvable." });
  const isOwner = review.userId === req.user!.sub;
  const isStaff = req.user!.role === "ADMIN" || req.user!.role === "SUPERADMIN";
  if (!isOwner && !isStaff) return res.status(403).json({ error: "Accès refusé." });
  await prisma.review.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
