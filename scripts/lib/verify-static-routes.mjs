export const requiredStaticRoutes = [
  "/",
  "/blog",
  "/tdee-calculator",
  "/blog/feed.xml",
  "/api/cheat-sheet/pdf",
  "/api/macro-cheat-sheet/pdf",
];

export function verifyStaticRoutes(manifest) {
  const missingRoutes = requiredStaticRoutes.filter(
    (route) => !manifest.routes?.[route]
  );

  if (missingRoutes.length > 0) {
    throw new Error(
      `Missing prerendered routes: ${missingRoutes.join(", ")}`
    );
  }

  for (const route of ["/api/cheat-sheet/pdf", "/api/macro-cheat-sheet/pdf"]) {
    if (manifest.routes[route].initialRevalidateSeconds !== false) {
      throw new Error(`${route} must remain static until the next deployment`);
    }
  }

  const blogRoute = manifest.dynamicRoutes?.["/blog/[slug]"];
  if (!blogRoute || blogRoute.fallback !== false) {
    throw new Error("/blog/[slug] must have fallback: false");
  }
}
