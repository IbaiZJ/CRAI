import { render } from "@testing-library/react"
import { vi } from "vitest"

import { ChartBarSkeleton, ChartSkeleton } from "@/components/charts/ChartSkeleton"

describe("ChartSkeleton", () => {
  it("renders basic skeleton", () => {
    const { container } = render(<ChartSkeleton />)
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it("renders select skeleton when enabled", () => {
    const { container } = render(<ChartSkeleton hasSelect />)
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(2)
  })

  it("renders bar skeleton with deterministic heights", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5)
    const { container } = render(<ChartBarSkeleton />)
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(6)
    randomSpy.mockRestore()
  })
})
