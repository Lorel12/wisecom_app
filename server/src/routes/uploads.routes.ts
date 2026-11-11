import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import { env } from "../lib/env.js";
import { authenticate, requireRole } from "../middleware/auth.js";

export const uploadsRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "..", "uploads");

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const storage = process.env.NODE_ENV === "production" ? multer.memoryStorage() : diskStorage;

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Format d'image non supporté (jpeg, png, webp, gif uniquement)."));
  },
});

async function uploadToSupabase(file: Express.Multer.File) {
  const baseUrl = env.supabase.url.replace(/\/$/, "");
  const fileName = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
  const objectPath = `${env.supabase.storageBucket}/${fileName}`;
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${objectPath.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
        apikey: env.supabase.serviceRoleKey,
        "Content-Type": file.mimetype,
        "x-upsert": "true",
      },
      body: file.buffer,
    },
  );

  if (!response.ok) {
    throw new Error(`Le stockage d'images a refusé le fichier (${response.status}).`);
  }

  return `${baseUrl}/storage/v1/object/public/${objectPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

uploadsRouter.post(
  "/",
  authenticate,
  requireRole("ADMIN", "SUPERADMIN"),
  (_req, res, next) => {
    if (process.env.NODE_ENV === "production" && (!env.supabase.url || !env.supabase.serviceRoleKey)) {
      return res.status(503).json({ error: "Le stockage d'images n'est pas configuré." });
    }
    return next();
  },
  upload.array("images", 8),
  async (req, res, next) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    try {
      const urls =
        process.env.NODE_ENV === "production"
          ? await Promise.all(files.map(uploadToSupabase))
          : files.map((file) => `/uploads/${file.filename}`);
      return res.status(201).json({ urls });
    } catch (error) {
      return next(error);
    }
  },
);
