import type { L10n, Market } from "@/data/schema";

// LOREM placeholders: fake text at real square coordinates, so the list and
// (from stage 2) the map can be seen with all eight launch cities. Only in
// `npm run dev` (TROPINA_INCLUDE_PLACEHOLDER_DATA=1). Never in production or
// e2e. Delete this folder when the real cards arrive.

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.";

const same = (text: string): L10n => ({ en: text, pl: text, ru: text, uk: text });

type Row = {
  city: string;
  name: L10n;
  lat: number;
  lng: number;
  address: string;
  start: string;
  end: string;
  verified: boolean;
};

const rows: Row[] = [
  {
    city: "krakow",
    name: { en: "Kraków", pl: "Kraków", ru: "Краков", uk: "Краків" },
    lat: 50.0617,
    lng: 19.9373,
    address: "Rynek Główny, Kraków",
    start: "2026-11-28",
    end: "2026-12-26",
    verified: true,
  },
  {
    city: "poznan",
    name: { en: "Poznań", pl: "Poznań", ru: "Познань", uk: "Познань" },
    lat: 52.4084,
    lng: 16.934,
    address: "Stary Rynek, Poznań",
    start: "2026-11-20",
    end: "2026-12-23",
    verified: false,
  },
  {
    city: "opole",
    name: { en: "Opole", pl: "Opole", ru: "Ополе", uk: "Ополе" },
    lat: 50.6685,
    lng: 17.9228,
    address: "Rynek, Opole",
    start: "2026-12-01",
    end: "2026-12-22",
    verified: true,
  },
  {
    city: "gdansk",
    name: { en: "Gdańsk", pl: "Gdańsk", ru: "Гданьск", uk: "Гданськ" },
    lat: 54.3496,
    lng: 18.6497,
    address: "Targ Węglowy, Gdańsk",
    start: "2026-11-21",
    end: "2026-12-23",
    verified: false,
  },
  {
    city: "katowice",
    name: { en: "Katowice", pl: "Katowice", ru: "Катовице", uk: "Катовіце" },
    lat: 50.259,
    lng: 19.0215,
    address: "Rynek, Katowice",
    start: "2026-11-27",
    end: "2026-12-23",
    verified: true,
  },
  {
    city: "wroclaw",
    name: { en: "Wrocław", pl: "Wrocław", ru: "Вроцлав", uk: "Вроцлав" },
    lat: 51.1101,
    lng: 17.0326,
    address: "Rynek, Wrocław",
    start: "2026-11-20",
    end: "2026-12-31",
    verified: true,
  },
  {
    city: "warszawa",
    name: { en: "Warsaw", pl: "Warszawa", ru: "Варшава", uk: "Варшава" },
    lat: 52.2497,
    lng: 21.0122,
    address: "Rynek Starego Miasta, Warszawa",
    start: "2026-11-29",
    end: "2026-12-31",
    verified: false,
  },
  {
    city: "torun",
    name: { en: "Toruń", pl: "Toruń", ru: "Торунь", uk: "Торунь" },
    lat: 53.0103,
    lng: 18.6046,
    address: "Rynek Staromiejski, Toruń",
    start: "2026-11-28",
    end: "2026-12-21",
    verified: true,
  },
];

export const loremMarkets: Market[] = rows.map((r) => ({
  id: `${r.city}-lorem-ipsum`,
  country: "poland",
  city: { slug: r.city, name: r.name },
  slug: "lorem-ipsum",
  name: {
    en: `LOREM ${r.name.en} Christmas Market`,
    pl: `LOREM Jarmark Bożonarodzeniowy: ${r.name.pl}`,
    ru: `LOREM Рождественская ярмарка: ${r.name.ru}`,
    uk: `LOREM Різдвяний ярмарок: ${r.name.uk}`,
  },
  location: { lat: r.lat, lng: r.lng, address: r.address },
  season: { start: r.start, end: r.end },
  openingHours: [
    { days: [1, 2, 3, 4, 5], open: "11:00", close: "20:00" },
    { days: [6, 7], open: "10:00", close: "21:00" },
  ],
  hoursNote: same("Lorem ipsum: 24.12 — 14:00."),
  food: [{ name: same("Lorem ipsum"), note: same(LOREM) }, { name: same("Dolor sit amet") }],
  description: same(LOREM),
  transport: same(LOREM),
  accessibility: same(LOREM),
  officialUrl: "https://example.com/",
  verified: r.verified,
  lastChecked: "2026-11-15",
}));
