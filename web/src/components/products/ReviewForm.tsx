"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const t = useTranslations("product");
  const { user, status } = useAuthStore();
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (status === "ready" && !user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/connexion" className="font-medium text-primary hover:underline">
          Connectez-vous
        </Link>{" "}
        pour laisser un avis sur ce produit.
      </p>
    );
  }

  if (status !== "ready") return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Merci de choisir une note.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", { productId, rating, comment: comment || undefined });
      toast.success("Merci pour votre avis !");
      setRating(0);
      setComment("");
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'envoi de l'avis.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${value} étoiles`}
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  value <= (hoverRating || rating) ? "fill-accent text-accent" : "fill-transparent text-muted-foreground",
                )}
              />
            </button>
          );
        })}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Votre expérience avec ce produit (optionnel)"
        rows={3}
      />
      <Button type="submit" loading={submitting} className="w-fit">
        {t("writeReview")}
      </Button>
    </form>
  );
}
