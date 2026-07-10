import { describe, expect, it } from "vitest";
import {
  requiredStaticRoutes,
  verifyStaticRoutes,
} from "../lib/verify-static-routes.mjs";

function createManifest() {
  return {
    routes: Object.fromEntries(
      requiredStaticRoutes.map((route) => [route, { initialRevalidateSeconds: false }])
    ),
    dynamicRoutes: {
      "/blog/[slug]": { fallback: false },
    },
  };
}

describe("verifyStaticRoutes", () => {
  it("accepts required public routes and a disabled blog fallback", () => {
    expect(() => verifyStaticRoutes(createManifest())).not.toThrow();
  });

  it("rejects a missing public prerender", () => {
    const manifest = createManifest();
    delete manifest.routes["/blog"];

    expect(() => verifyStaticRoutes(manifest)).toThrow("/blog");
  });

  it("rejects a runtime blog fallback", () => {
    const manifest = createManifest();
    manifest.dynamicRoutes["/blog/[slug]"].fallback = null;

    expect(() => verifyStaticRoutes(manifest)).toThrow("/blog/[slug]");
  });
});
