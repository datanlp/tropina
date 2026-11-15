// MapLibre 6 starts its web worker from a separate file next to its module.
// Bundlers can't see that URL, so we serve the worker from /public instead.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const pkg = require.resolve("maplibre-gl/package.json");
const src = path.join(path.dirname(pkg), "dist", "maplibre-gl-worker.mjs");
const dest = path.join("public", "vendor", "maplibre-gl-worker.mjs");
mkdirSync(path.dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`Copied MapLibre worker to ${dest}`);
