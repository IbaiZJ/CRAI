import { render } from "@testing-library/react"
import { vi } from "vitest"

let lastProps: any = null

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark" }),
}))

vi.mock("sonner", () => ({
  Toaster: (props: any) => {
    lastProps = props
    return <div data-testid="sonner" />
  },
}))

import { Toaster } from "@/components/ui/sonner"

describe("Toaster", () => {
  it("passes theme and icons to sonner", () => {
    render(<Toaster position="top-right" />)
    expect(lastProps.theme).toBe("dark")
    expect(lastProps.icons).toBeTruthy()
  })
})
