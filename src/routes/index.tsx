import { createFileRoute } from "@tanstack/react-router";
import { VyntraApp } from "@/components/vyntra-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VYNTRA — Inteligência de Oportunidades" },
      {
        name: "description",
        content: "Qualifique, priorize e recupere oportunidades comerciais com inteligência.",
      },
      { property: "og:title", content: "VYNTRA — Inteligência de Oportunidades" },
      {
        property: "og:description",
        content: "Inteligência para transformar oportunidades em resultados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VyntraApp,
});
