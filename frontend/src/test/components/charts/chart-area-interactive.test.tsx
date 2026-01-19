import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import * as React from "react"

let lastAreaData: any[] | null = null

vi.mock("recharts", async () => {
  const React = await import("react")
  return {
    AreaChart: ({ data, children }: any) => {
      lastAreaData = data
      return <div data-testid="area-chart">{children}</div>
    },
    Area: ({ children }: any) => <div>{children}</div>,
    CartesianGrid: () => <div />,
    XAxis: () => <div />,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    Tooltip: ({ content }: any) => <div>{content}</div>,
    Legend: ({ content }: any) => <div>{content}</div>,
  }
})

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: ({ children }: any) => <span>{children}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}))

import { ChartAreaInteractive } from "@/components/charts/chart-area-interactive"

describe("ChartAreaInteractive", () => {
  afterEach(() => {
    lastAreaData = null
    vi.restoreAllMocks()
  })

  it("renders with default time range", () => {
    render(<ChartAreaInteractive />)
    expect(screen.getByText("Area Chart - Interactive")).toBeInTheDocument()
    expect(lastAreaData).toBeTruthy()
  })

  it("filters data for 30d and 7d ranges", () => {
    const useStateSpy = vi.spyOn(React, "useState")
    useStateSpy.mockReturnValueOnce(["30d", vi.fn()] as any)
    render(<ChartAreaInteractive />)
    const size30 = lastAreaData?.length || 0

    useStateSpy.mockReturnValueOnce(["7d", vi.fn()] as any)
    render(<ChartAreaInteractive />)
    const size7 = lastAreaData?.length || 0

    expect(size30).toBeGreaterThan(size7)
    expect(size7).toBeGreaterThan(0)
  })
})
