import { z } from "zod";

/** Every user-facing text in the data exists in all interface languages. */
const text = z.string().refine((s) => s.trim().length > 0, "must not be empty");

export const l10nSchema = z.strictObject({
  en: text,
  pl: text,
  ru: text,
  uk: text,
});

/** Latin, lowercase, no diacritics: `krakow`, `rynek-glowny`. */
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug: a-z, 0-9 and single dashes");

/** Calendar date `YYYY-MM-DD` that really exists. Interpreted in Europe/Warsaw. */
const isoDate = z.iso.date().refine((s) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}, "not a real calendar date");

const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "time: HH:MM, 00:00–23:59");

const weekday = z.union([1, 2, 3, 4, 5, 6, 7].map((n) => z.literal(n)));

export const marketSchema = z
  .strictObject({
    id: z.string(),
    country: z.literal("poland"),
    city: z.strictObject({ slug, name: l10nSchema }),
    slug,
    name: l10nSchema,
    location: z.strictObject({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      address: text,
    }),
    season: z
      .strictObject({ start: isoDate, end: isoDate })
      .refine((s) => s.start <= s.end, "season.end is before season.start"),
    openingHours: z
      .array(
        z.strictObject({
          days: z.array(weekday).min(1),
          open: time,
          close: time,
        }),
      )
      .min(1),
    /** Machine-readable exceptions (24–26 Dec etc.) used by "open now". */
    hoursExceptions: z
      .array(
        z.union([
          z.strictObject({ date: isoDate, closed: z.literal(true) }),
          z.strictObject({ date: isoDate, open: time, close: time }),
        ]),
      )
      .optional(),
    hoursNote: l10nSchema.optional(),
    food: z.array(z.strictObject({ name: l10nSchema, note: l10nSchema.optional() })),
    description: l10nSchema,
    transport: l10nSchema.optional(),
    accessibility: l10nSchema.optional(),
    officialUrl: z.url({ protocol: /^https?$/ }),
    verified: z.boolean(),
    lastChecked: isoDate,
    suggestedBy: text.optional(),
  })
  .refine((m) => m.id === `${m.city.slug}-${m.slug}`, {
    message: "id must be `{city.slug}-{slug}`",
    path: ["id"],
  });

export const marketListSchema = z.array(marketSchema).superRefine((list, ctx) => {
  const seen = new Set<string>();
  for (const [i, m] of list.entries()) {
    if (seen.has(m.id)) {
      ctx.addIssue({ code: "custom", message: `duplicate id ${m.id}`, path: [i, "id"] });
    }
    seen.add(m.id);
  }
});

export type L10n = z.infer<typeof l10nSchema>;
export type Market = z.infer<typeof marketSchema>;
