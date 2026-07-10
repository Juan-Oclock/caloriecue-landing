import { readFile } from "node:fs/promises";
import {
  requiredStaticRoutes,
  verifyStaticRoutes,
} from "./lib/verify-static-routes.mjs";

const manifestPath = new URL("../.next/prerender-manifest.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

verifyStaticRoutes(manifest);

console.log(
  `Verified static routes: ${requiredStaticRoutes.join(", ")}; /blog/[slug] fallback disabled.`
);
