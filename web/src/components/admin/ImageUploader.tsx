"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { cn, resolveImageUrl } from "@/lib/utils";

export function ImageUploader({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    setUploading(true);
    try {
      const { urls } = await api.post<{ urls: string[] }>("/uploads", formData);
      onChange([...images, ...urls]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'envoi des images.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative size-24 overflow-hidden rounded-lg border border-border bg-secondary">
            <Image src={resolveImageUrl(url)} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-neutral-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
          )}
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <span className="text-[11px]">Ajouter</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
