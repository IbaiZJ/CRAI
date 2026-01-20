import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"

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
  Select: ({ children, onValueChange }: any) => (
    <div>
      <button data-testid="range-90d" onClick={() => onValueChange?.("90d")}>
        90d
      </button>
      <button data-testid="range-30d" onClick={() => onValueChange?.("30d")}>
        30d
      </button>
      <button data-testid="range-7d" onClick={() => onValueChange?.("7d")}>
        7d
      </button>
      {children}
    </div>
  ),
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

  it("filters data for 30d and 7d ranges", async () => {
    const user = userEvent.setup()
    render(<ChartAreaInteractive />)
    const size90 = lastAreaData?.length || 0

    await user.click(screen.getByTestId("range-30d"))
    const size30 = lastAreaData?.length || 0

    await user.click(screen.getByTestId("range-7d"))
    const size7 = lastAreaData?.length || 0

    expect(size90).toBeGreaterThan(size30)
    expect(size30).toBeGreaterThan(size7)
    expect(size7).toBeGreaterThan(0)
  })
})
