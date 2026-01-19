import { describe, it, expect, vi } from "vitest"

describe("google-oauth", () => {
  it("warns when client id missing", async () => {
    vi.resetModules()
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "")

    const mod = await import("@/lib/google-oauth")
    expect(mod.GOOGLE_CLIENT_ID).toBe("")
    expect(warn).toHaveBeenCalled()
  })

  it("returns client id when set", async () => {
    vi.resetModules()
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "abc123")

    const mod = await import("@/lib/google-oauth")
    expect(mod.GOOGLE_CLIENT_ID).toBe("abc123")
  })
})
