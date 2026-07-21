import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

export const wishlistRouter = Router();

wishlistRouter.use(authenticate);

wishlistRouter.get("/", async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.sub },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ items });
});

wishlistRouter.post("/:productId", async (req, res) => {
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user!.sub, productId: req.params.productId } },
    create: { userId: req.user!.sub, productId: req.params.productId },
    update: {},
  });
  res.status(201).json({ item });
});

wishlistRouter.delete("/:productId", async (req, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user!.sub, productId: req.params.productId },
  });
  res.status(204).send();
});
