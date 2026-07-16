import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

export const ordersRouter = Router();

const createOrderSchema = z.object({
  addressId: z.string().optional(),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CMD-${stamp}-${rand}`;
}

const SHIPPING_FEE_YAOUNDE = 1000;

ordersRouter.post("/", authenticate, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });
  const { addressId, note, items } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
  });

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return res.status(400).json({ error: `Produit introuvable : ${item.productId}` });
    if (product.quantity < item.quantity) {
      return res.status(409).json({ error: `Stock insuffisant pour "${product.name}".` });
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);
  const total = subtotal + SHIPPING_FEE_YAOUNDE;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user!.sub,
        addressId,
        note,
        subtotal,
        shippingFee: SHIPPING_FEE_YAOUNDE,
        total,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: product.id,
              name: product.name,
              unitPrice: product.price,
              quantity: item.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    return created;
  });

  res.status(201).json({ order });
});

ordersRouter.get("/mine", authenticate, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.sub },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
});

ordersRouter.get("/:id", authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, payment: true, address: true },
  });
  if (!order) return res.status(404).json({ error: "Commande introuvable." });
  const isOwner = order.userId === req.user!.sub;
  const isStaff = req.user!.role === "ADMIN" || req.user!.role === "SUPERADMIN";
  if (!isOwner && !isStaff) return res.status(403).json({ error: "Accès refusé." });
  res.json({ order });
});

ordersRouter.get("/", authenticate, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true, payment: true, user: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"]),
});

ordersRouter.patch("/:id/status", authenticate, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Statut invalide." });
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
  res.json({ order });
});
