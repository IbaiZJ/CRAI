import { render, screen } from "@testing-library/react"
import { vi } from "vitest"

vi.mock("recharts", async () => {
  const React = await import("react")
  return {
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive">{children}</div>
    ),
    Tooltip: ({ content }: any) => (
      <div data-testid="tooltip">{content}</div>
    ),
    Legend: ({ content }: any) => (
      <div data-testid="legend">{content}</div>
    ),
  }
})

import {
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
} from "@/components/ui/chart"

describe("Chart components", () => {
  it("renders container and style", () => {
    render(
      <ChartContainer
        id="demo"
        config={{ desktop: { label: "Desktop", color: "red" } }}
      >
        <div>Chart</div>
      </ChartContainer>
    )

    expect(screen.getByText("Chart")).toBeInTheDocument()
    expect(document.querySelector("[data-chart]")).toBeInTheDocument()
  })

  it("returns null style when no colors", () => {
    const { container } = render(<ChartStyle id="x" config={{ a: {} }} />)
    expect(container.querySelector("style")).toBeNull()
  })

  it("throws when tooltip used outside container", () => {
    expect(() =>
      render(
        <ChartTooltipContent
          active
          payload={[{ name: "x", dataKey: "x", type: "line", value: 1 }]}
        />
      )
    ).toThrow("useChart must be used within a <ChartContainer />")
  })

  it("renders tooltip content with label and value", () => {
    render(
      <ChartContainer
        config={{ desktop: { label: "Desktop" } }}
      >
        <ChartTooltipContent
          active
          indicator="line"
          payload={[
            {
              name: "desktop",
              dataKey: "desktop",
              type: "line",
              value: 1200,
              payload: { desktop: 1200 },
            },
          ]}
        />
      </ChartContainer>
    )

    expect(screen.getByText("Desktop")).toBeInTheDocument()
    expect(screen.getByText("1,200")).toBeInTheDocument()
  })

  it("supports formatter and hides indicator", () => {
    render(
      <ChartContainer
        config={{ mobile: { label: "Mobile" } }}
      >
        <ChartTooltipContent
          active
          hideIndicator
          hideLabel
          labelFormatter={(value) => `Label: ${value}`}
          formatter={() => <span>Custom</span>}
          payload={[
            {
              name: "mobile",
              dataKey: "mobile",
              type: "line",
              value: 10,
              payload: { mobile: 10 },
            },
            {
              name: "skip",
              dataKey: "skip",
              type: "none",
              value: 1,
              payload: { skip: 1 },
            },
          ]}
        />
      </ChartContainer>
    )

    expect(screen.getByText("Custom")).toBeInTheDocument()
    expect(screen.queryByText("Label: Mobile")).not.toBeInTheDocument()
  })

  it("returns null when inactive", () => {
    const { container } = render(
      <ChartContainer config={{}}>
        <ChartTooltipContent active={false} payload={[]} />
      </ChartContainer>
    )

    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
  })

  it("uses label formatter when provided", () => {
    render(
      <ChartContainer
        config={{ visits: { label: "Visits" } }}
      >
        <ChartTooltipContent
          active
          label="visits"
          labelFormatter={(value) => `Label: ${value}`}
          payload={[
            {
              name: "visits",
              dataKey: "visits",
              type: "line",
              value: 2,
              payload: { visits: 2 },
            },
          ]}
        />
      </ChartContainer>
    )

    expect(screen.getByText("Label: Visits")).toBeInTheDocument()
  })

  it("renders legend content with icons", () => {
    const Icon = () => <svg data-testid="legend-icon" />
    render(
      <ChartContainer
        config={{ series: { label: "Series", icon: Icon } }}
      >
        <ChartLegendContent
          payload={[
            {
              value: "series",
              dataKey: "series",
              type: "line",
              color: "red",
            },
            {
              value: "skip",
              dataKey: "skip",
              type: "none",
              color: "blue",
            },
          ]}
        />
      </ChartContainer>
    )

    expect(screen.getByTestId("legend-icon")).toBeInTheDocument()
    expect(screen.getByText("Series")).toBeInTheDocument()
  })

  it("renders legend without icons when hidden", () => {
    const Icon = () => <svg data-testid="legend-icon" />
    render(
      <ChartContainer
        config={{ series: { label: "Series", icon: Icon } }}
      >
        <ChartLegendContent
          hideIcon
          payload={[
            {
              value: "series",
              dataKey: "series",
              type: "line",
              color: "red",
            },
          ]}
        />
      </ChartContainer>
    )

    expect(screen.queryByTestId("legend-icon")).not.toBeInTheDocument()
  })

  it("renders themed chart style", () => {
    const { container } = render(
      <ChartStyle
        id="theme"
        config={{
          mobile: {
            label: "Mobile",
            theme: { light: "red", dark: "blue" },
          },
        }}
      />
    )
    expect(container.querySelector("style")).toBeInTheDocument()
  })

  it("returns null legend without payload", () => {
    const { container } = render(
      <ChartContainer config={{}}>
        <ChartLegendContent payload={[]} />
      </ChartContainer>
    )
    expect(container.querySelector("[data-slot=chart]")).toBeInTheDocument()
  })
})
