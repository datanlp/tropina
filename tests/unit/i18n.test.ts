import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import pl from "../../messages/pl.json";
import ru from "../../messages/ru.json";
import uk from "../../messages/uk.json";
import { routing } from "@/i18n/routing";

function flatten(obj: object, prefix = ""): Record<string, unknown> {
  return Object.entries(obj).reduce<Record<string, unknown>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") Object.assign(acc, flatten(v, key));
    else acc[key] = v;
    return acc;
  }, {});
}

describe("i18n", () => {
  it("supports en (default), pl, ru and uk", () => {
    expect([...routing.locales]).toEqual(["en", "pl", "ru", "uk"]);
    expect(routing.defaultLocale).toBe("en");
  });

  it("does not use a locale cookie (no cookies policy)", () => {
    expect(routing.localeCookie).toBe(false);
  });

  const files = { pl, ru, uk };
  const enKeys = Object.keys(flatten(en)).sort();

  it.each(Object.entries(files))("%s has exactly the same keys as en", (_lang, messages) => {
    expect(Object.keys(flatten(messages)).sort()).toEqual(enKeys);
  });

  it.each(Object.entries({ en, ...files }))("%s has no empty strings", (_lang, messages) => {
    for (const [key, value] of Object.entries(flatten(messages))) {
      expect(typeof value === "string" && value.trim().length > 0, key).toBe(true);
    }
  });
});
