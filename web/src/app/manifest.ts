import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cité Market — Boutique Cité des Nations",
    short_name: "Cité Market",
    description: "Ordinateurs, téléphones, ustensiles de cuisine et accessoires, neufs et d'occasion, à Yaoundé.",
    start_url: "/fr",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d56d6",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
