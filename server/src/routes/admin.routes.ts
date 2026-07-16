import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ADMIN", "SUPERADMIN"));

adminRouter.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  res.json({ users });
});

const roleSchema = z.object({ role: z.enum(["CLIENT", "ADMIN"]) });

/**
 * Nomme ou révoque un administrateur. Seul un SUPERADMIN peut modifier les rôles
 * (un ADMIN ne peut pas se donner ou donner à d'autres des droits supplémentaires).
 */
adminRouter.patch("/users/:id/role", requireRole("SUPERADMIN"), async (req, res) => {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Rôle invalide." });
  if (req.params.id === req.user!.sub) {
    return res.status(400).json({ error: "Vous ne pouvez pas modifier votre propre rôle." });
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: parsed.data.role, promotedBy: req.user!.sub },
  });
  res.json({ user });
});

adminRouter.patch("/users/:id/status", requireRole("SUPERADMIN"), async (req, res) => {
  const schema = z.object({ isActive: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: parsed.data.isActive } });
  res.json({ user });
});

adminRouter.get("/stats", async (_req, res) => {
  const [productCount, orderCount, userCount, revenue] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
  ]);
  res.json({
    productCount,
    orderCount,
    userCount,
    revenue: revenue._sum.total ?? 0,
  });
});
