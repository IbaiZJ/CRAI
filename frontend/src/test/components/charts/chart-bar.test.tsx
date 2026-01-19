import { render, screen } from "@testing-library/react"
import { vi } from "vitest"

vi.mock("recharts", async () => {
  const React = await import("react")
  return {
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ children }: any) => <div>{children}</div>,
    CartesianGrid: () => <div />,
    XAxis: () => <div />,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    Tooltip: ({ content }: any) => <div>{content}</div>,
    Legend: ({ content }: any) => <div>{content}</div>,
  }
})

import { ChartBarDefault } from "@/components/charts/barCharts/chart-bar-default"
import { ChartBarMixed } from "@/components/charts/barCharts/chart-bar-mixed"
import { ChartBarStacked } from "@/components/charts/barCharts/chart-bar-stacked"

describe("Bar charts", () => {
  it("renders default bar chart", () => {
    render(<ChartBarDefault />)
    expect(screen.getByText("Bar Chart")).toBeInTheDocument()
  })

  it("renders mixed bar chart", () => {
    render(<ChartBarMixed />)
    expect(screen.getByText("Bar Chart - Mixed")).toBeInTheDocument()
  })

  it("renders stacked bar chart", () => {
    render(<ChartBarStacked />)
    expect(screen.getByText("Bar Chart - Stacked + Legend")).toBeInTheDocument()
  })
})
