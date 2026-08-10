import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(() => ({ rpc: vi.fn() })),
}));

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));

import { createServiceRoleClient } from "@/lib/supabase/service-role";

describe("createServiceRoleClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mocks.createClient.mockClear();
  });

  it("prefers the modern Supabase secret key for server requests", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://bxhgpvkkeyguovvyqsft.supabase.co",
    );
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_modern_server_key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy-service-role-key");

    createServiceRoleClient();

    expect(mocks.createClient).toHaveBeenCalledWith(
      "https://bxhgpvkkeyguovvyqsft.supabase.co",
      "sb_secret_modern_server_key",
      expect.objectContaining({
        auth: expect.objectContaining({ persistSession: false }),
      }),
    );
  });
});
