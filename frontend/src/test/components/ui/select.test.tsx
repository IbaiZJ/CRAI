import { render, screen } from "@testing-library/react"
import { vi } from "vitest"

vi.mock("@radix-ui/react-select", async () => {
  const React = await import("react")
  const Wrapper = ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  )
  return {
    Root: Wrapper,
    Group: Wrapper,
    Value: ({ children, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
    Trigger: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    Icon: Wrapper,
    Portal: Wrapper,
    Content: Wrapper,
    Viewport: Wrapper,
    Label: Wrapper,
    Item: Wrapper,
    ItemIndicator: Wrapper,
    ItemText: Wrapper,
    Separator: Wrapper,
    ScrollUpButton: Wrapper,
    ScrollDownButton: Wrapper,
  }
})

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

describe("Select", () => {
  it("renders select elements", () => {
    render(
      <Select>
        <SelectTrigger size="sm">
          <SelectValue>Pick</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectLabel>Group</SelectLabel>
          <SelectItem value="a">Option A</SelectItem>
          <SelectSeparator />
        </SelectContent>
      </Select>
    )

    expect(screen.getByText("Pick")).toBeInTheDocument()
    const trigger = document.querySelector('[data-slot="select-trigger"]')
    expect(trigger).toHaveAttribute("data-size", "sm")
    expect(screen.getByText("Option A")).toBeInTheDocument()
  })
})
