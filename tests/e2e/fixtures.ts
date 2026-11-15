import AxeBuilder from "@axe-core/playwright";
import { test as base, expect } from "@playwright/test";

export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Every e2e test runs axe on the page it ends on. Any WCAG 2.2 AA violation
 * fails the test. Do not opt out of this fixture.
 */
export const test = base.extend<{ axe: void }>({
  axe: [
    async ({ page }, use) => {
      await use();
      if (page.url() === "about:blank") return;
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      const summary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        targets: v.nodes.map((n) => n.target.join(" ")),
      }));
      expect(summary, `axe violations on ${page.url()}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
