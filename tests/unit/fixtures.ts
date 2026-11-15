import type { Market } from "@/data/schema";

/** A minimal valid market. Tests clone it and break one field at a time. */
export function validMarket(): Market {
  return {
    id: "krakow-rynek-glowny",
    country: "poland",
    city: {
      slug: "krakow",
      name: { en: "Kraków", pl: "Kraków", ru: "Краков", uk: "Краків" },
    },
    slug: "rynek-glowny",
    name: {
      en: "Main Market Square",
      pl: "Rynek Główny",
      ru: "Главная рыночная площадь",
      uk: "Головна ринкова площа",
    },
    location: { lat: 50.0617, lng: 19.9373, address: "Rynek Główny, Kraków" },
    season: { start: "2026-11-28", end: "2026-12-26" },
    openingHours: [{ days: [1, 2, 3, 4, 5, 6, 7], open: "10:00", close: "21:00" }],
    food: [
      {
        name: { en: "Mulled wine", pl: "Grzaniec", ru: "Гжанец", uk: "Гжанець" },
      },
    ],
    description: {
      en: "Description",
      pl: "Opis",
      ru: "Описание",
      uk: "Опис",
    },
    officialUrl: "https://example.com/",
    verified: true,
    lastChecked: "2026-11-01",
  };
}
