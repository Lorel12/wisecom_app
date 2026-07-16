import type { NextFunction, Request, Response } from "express";
import { env } from "../lib/env.js";
import { verifyToken, type JwtPayload } from "../lib/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName] as string | undefined;
  if (!token) {
    return res.status(401).json({ error: "Non authentifié." });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Session invalide ou expirée." });
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName] as string | undefined;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // ignore token invalide, l'utilisateur reste anonyme
    }
  }
  next();
}

export function requireRole(...roles: Array<"CLIENT" | "ADMIN" | "SUPERADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé." });
    }
    next();
  };
}
