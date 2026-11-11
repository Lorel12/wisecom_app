import fs from "node:fs";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { categoriesRouter } from "./routes/categories.routes.js";
import { productsRouter } from "./routes/products.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { paymentsRouter } from "./routes/payments.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { reviewsRouter } from "./routes/reviews.routes.js";
import { wishlistRouter } from "./routes/wishlist.routes.js";
import { addressesRouter } from "./routes/addresses.routes.js";
import { uploadsRouter, uploadsDir } from "./routes/uploads.routes.js";
import { contactRouter } from "./routes/contact.routes.js";
import { prisma } from "./lib/prisma.js";

fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: "ok" });
  } catch {
    return res.status(503).json({ status: "unavailable" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/contact", contactRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route inconnue : ${req.method} ${req.path}` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(env.port, () => {
  console.log(`API disponible sur http://localhost:${env.port}`);
});
