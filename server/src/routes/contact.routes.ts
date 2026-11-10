import { Router } from "express";
import { z } from "zod";
import { sendContactMessage } from "../lib/email.js";

export const contactRouter = Router();

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

contactRouter.post("/", async (req, res, next) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Données invalides.", details: parsed.error.flatten() });
  }

  try {
    const sent = await sendContactMessage(parsed.data);
    if (!sent) {
      return res.status(503).json({ error: "L'envoi par e-mail n'est pas configuré." });
    }
    return res.json({ message: "Message envoyé." });
  } catch (error) {
    return next(error);
  }
});
