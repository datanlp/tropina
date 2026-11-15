import type { Market } from "@/data/schema";

// TEST record: never part of a production build. Real data replaces it.
export const wroclawTestRynek: Market = {
  id: "wroclaw-test-rynek",
  country: "poland",
  city: {
    slug: "wroclaw",
    name: { en: "Wrocław", pl: "Wrocław", ru: "Вроцлав", uk: "Вроцлав" },
  },
  slug: "test-rynek",
  name: {
    en: "TEST Wrocław Christmas Market",
    pl: "TEST Wrocławski Jarmark Bożonarodzeniowy",
    ru: "TEST Рождественская ярмарка во Вроцлаве",
    uk: "TEST Різдвяний ярмарок у Вроцлаві",
  },
  location: { lat: 51.1101, lng: 17.0326, address: "Rynek, 50-106 Wrocław" },
  season: { start: "2026-11-20", end: "2026-12-31" },
  openingHours: [
    { days: [1, 2, 3, 4, 5], open: "10:00", close: "21:00" },
    { days: [6, 7], open: "10:00", close: "22:00" },
  ],
  food: [],
  description: {
    en: "TEST record with unverified dates. Not real data.",
    pl: "Rekord TEST z niepotwierdzonymi datami. To nie są prawdziwe dane.",
    ru: "Запись TEST с неподтверждёнными датами. Это не настоящие данные.",
    uk: "Запис TEST з непідтвердженими датами. Це не справжні дані.",
  },
  officialUrl: "https://example.org/",
  verified: false,
  lastChecked: "2026-11-15",
  suggestedBy: "@test_user",
};
