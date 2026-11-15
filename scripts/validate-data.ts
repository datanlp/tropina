// Runs before every `next build`. Validates real and TEST records with zod
// and exits non-zero on the first problem, so a broken record fails the build.
import { loadMarkets } from "../src/data/markets";

try {
  const real = loadMarkets({ includeTest: false });
  const withTest = loadMarkets({ includeTest: true });
  const all = loadMarkets({ includeTest: true, includePlaceholders: true });
  console.log(
    `Market data OK: ${real.length} real, ${withTest.length - real.length} TEST, ` +
      `${all.length - withTest.length} LOREM.`,
  );
} catch (error) {
  console.error("Market data is invalid:\n", error);
  process.exit(1);
}
