"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { ReviewForm } from "./ReviewForm";

export function ProductReviews({ productId, reviews, locale }: { productId: string; reviews: Review[]; locale: string }) {
  const t = useTranslations("product");
  const router = useRouter();

  return (
    <div className="mt-16 border-t border-border pt-10">
      <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground">
        {t("reviews")} {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      <div className="mb-8">
        <ReviewForm productId={productId} onSubmitted={() => router.refresh()} />
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noReviews")}</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {reviews.map((review) => (
            <li key={review.id} className="flex gap-3">
              <Avatar name={`${review.user?.firstName ?? "?"} ${review.user?.lastName ?? ""}`} src={review.user?.avatarUrl} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {review.user?.firstName} {review.user?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(review.createdAt, locale)}</span>
                </div>
                <RatingStars rating={review.rating} className="my-1" />
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
