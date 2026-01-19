import { render, screen } from "@testing-library/react"

import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

describe("Label, Separator, Textarea", () => {
  it("renders label and textarea", () => {
    render(
      <div>
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" />
      </div>
    )

    expect(screen.getByText("Note")).toBeInTheDocument()
    expect(document.querySelector('[data-slot="label"]')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="textarea"]')).toBeInTheDocument()
  })

  it("renders vertical separator", () => {
    render(<Separator orientation="vertical" />)
    const sep = document.querySelector('[data-slot="separator"]')
    expect(sep).toHaveAttribute("data-orientation", "vertical")
  })
})
