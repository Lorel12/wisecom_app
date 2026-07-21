import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

export const addressesRouter = Router();

addressesRouter.use(authenticate);

addressesRouter.get("/", async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.sub },
    orderBy: { isDefault: "desc" },
  });
  res.json({ addresses });
});

const addressSchema = z.object({
  label: z.string().default("Domicile"),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  city: z.string().default("Yaoundé"),
  district: z.string().min(2),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(false),
});

addressesRouter.post("/", async (req, res) => {
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.sub }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({ data: { ...parsed.data, userId: req.user!.sub } });
  res.status(201).json({ address });
});

addressesRouter.patch("/:id", async (req, res) => {
  const parsed = addressSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });

  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.sub) return res.status(404).json({ error: "Adresse introuvable." });

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.sub }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ address });
});

addressesRouter.delete("/:id", async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.sub) return res.status(404).json({ error: "Adresse introuvable." });
  await prisma.address.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
