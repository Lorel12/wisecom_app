import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole } from "../middleware/auth.js";

export const uploadsRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Format d'image non supporté (jpeg, png, webp, gif uniquement)."));
  },
});

uploadsRouter.post(
  "/",
  authenticate,
  requireRole("ADMIN", "SUPERADMIN"),
  upload.array("images", 8),
  (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const urls = files.map((file) => `/uploads/${file.filename}`);
    res.status(201).json({ urls });
  },
);
