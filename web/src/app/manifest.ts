import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WISECOM Global Trading and Supplies",
    short_name: "WISECOM",
    description: "Électronique, équipement de la maison, motos et véhicules, import-export et services techniques, entre Douala et Yaoundé.",
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
