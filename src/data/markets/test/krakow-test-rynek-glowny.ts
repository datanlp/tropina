import type { Market } from "@/data/schema";

// TEST record: never part of a production build. Real data replaces it.
export const krakowTestRynekGlowny: Market = {
  id: "krakow-test-rynek-glowny",
  country: "poland",
  city: {
    slug: "krakow",
    name: { en: "Kraków", pl: "Kraków", ru: "Краков", uk: "Краків" },
  },
  slug: "test-rynek-glowny",
  name: {
    en: "TEST Main Square Christmas Market",
    pl: "TEST Jarmark Bożonarodzeniowy na Rynku Głównym",
    ru: "TEST Рождественская ярмарка на Главной площади",
    uk: "TEST Різдвяний ярмарок на Головній площі",
  },
  location: { lat: 50.0617, lng: 19.9373, address: "Rynek Główny, 31-042 Kraków" },
  season: { start: "2026-11-28", end: "2026-12-26" },
  openingHours: [{ days: [1, 2, 3, 4, 5, 6, 7], open: "10:00", close: "22:00" }],
  hoursNote: {
    en: "TEST: 24 Dec until 14:00, closed 25 Dec.",
    pl: "TEST: 24.12 do 14:00, 25.12 nieczynne.",
    ru: "TEST: 24.12 до 14:00, 25.12 закрыто.",
    uk: "TEST: 24.12 до 14:00, 25.12 зачинено.",
  },
  food: [
    {
      name: { en: "Mulled wine (grzaniec)", pl: "Grzaniec", ru: "Гжанец", uk: "Гжанець" },
    },
    {
      name: { en: "Oscypek", pl: "Oscypek", ru: "Осцыпек", uk: "Осципок" },
      note: {
        en: "Smoked sheep cheese, grilled, with cranberry jam.",
        pl: "Wędzony ser owczy z grilla z żurawiną.",
        ru: "Копчёный овечий сыр на гриле с клюквенным вареньем.",
        uk: "Копчений овечий сир на грилі з журавлинним варенням.",
      },
    },
  ],
  description: {
    en: "TEST record for development. Not real data.",
    pl: "Rekord TEST do developmentu. To nie są prawdziwe dane.",
    ru: "Запись TEST для разработки. Это не настоящие данные.",
    uk: "Запис TEST для розробки. Це не справжні дані.",
  },
  transport: {
    en: "TEST: trams 1, 6, 8 to Plac Wszystkich Świętych.",
    pl: "TEST: tramwaje 1, 6, 8 do Placu Wszystkich Świętych.",
    ru: "TEST: трамваи 1, 6, 8 до Plac Wszystkich Świętych.",
    uk: "TEST: трамваї 1, 6, 8 до Plac Wszystkich Świętych.",
  },
  accessibility: {
    en: "TEST: flat square, cobblestones.",
    pl: "TEST: płaski plac, bruk.",
    ru: "TEST: ровная площадь, брусчатка.",
    uk: "TEST: рівна площа, бруківка.",
  },
  officialUrl: "https://example.com/",
  verified: true,
  lastChecked: "2026-11-15",
};
