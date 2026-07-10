export const requiredStaticRoutes = [
  "/",
  "/blog",
  "/tdee-calculator",
  "/blog/feed.xml",
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

  const blogRoute = manifest.dynamicRoutes?.["/blog/[slug]"];
  if (!blogRoute || blogRoute.fallback !== false) {
    throw new Error("/blog/[slug] must have fallback: false");
  }
}
