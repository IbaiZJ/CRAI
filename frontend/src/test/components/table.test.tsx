import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuCheckboxItem: ({ children, onCheckedChange }: any) => (
    <button onClick={() => onCheckedChange?.(true)}>{children}</button>
  ),
}))

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      {...props}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}))

import { DataTableDemo } from "@/components/table"

describe("DataTableDemo", () => {
  it("renders table and supports copy action", async () => {
    const user = userEvent.setup()
    const writeText = vi.fn()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })

    render(<DataTableDemo />)

    expect(screen.getByPlaceholderText("Filter emails...")).toBeInTheDocument()
    expect(screen.getByText("Columns")).toBeInTheDocument()

    const copyButtons = screen.getAllByRole("button", { name: "Copy payment ID" })
    await user.click(copyButtons[0])
    expect(writeText).toHaveBeenCalled()
  })
})
