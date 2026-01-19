import { describe, it, expect } from "vitest"

import data, { type Payment } from "@/constants/paymentConstant"

describe("paymentConstant", () => {
  it("exports payment list", () => {
    expect(Array.isArray(data)).toBe(true)
    expect((data as Payment[]).length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty("id")
  })
})
