import { describe, expect, it } from "vitest";
import { buildAdminCsp, buildPublicCsp } from "@/lib/csp";

describe("CSP policies", () => {
  it("builds a cache-compatible public policy without a nonce", () => {
    const csp = buildPublicCsp(false);

    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).not.toContain("'nonce-");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("builds a strict admin policy with the request nonce", () => {
    const csp = buildAdminCsp("admin-nonce", false);
    const scriptDirective = csp.split("; ")[0];

    expect(scriptDirective).toContain(
      "script-src 'nonce-admin-nonce' 'strict-dynamic'"
    );
    expect(scriptDirective).not.toContain("'unsafe-inline'");
  });

  it("allows eval only in development", () => {
    expect(buildPublicCsp(true)).toContain("'unsafe-eval'");
    expect(buildAdminCsp("nonce", true)).toContain("'unsafe-eval'");
  });

  it("retains the shared security and analytics directives", () => {
    for (const csp of [buildPublicCsp(false), buildAdminCsp("nonce", false)]) {
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("require-trusted-types-for 'script'");
      expect(csp).toContain("https://*.supabase.co");
      expect(csp).toContain("https://www.google-analytics.com");
    }
  });
});
