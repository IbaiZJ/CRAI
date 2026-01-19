import { render, screen } from "@testing-library/react"

import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group"

describe("ButtonGroup", () => {
  it("renders group with orientation", () => {
    render(
      <ButtonGroup orientation="vertical">
        <button>One</button>
        <button>Two</button>
      </ButtonGroup>
    )

    const group = document.querySelector('[data-slot="button-group"]')
    expect(group).toHaveAttribute("data-orientation", "vertical")
    expect(screen.getByText("One")).toBeInTheDocument()
  })

  it("renders text and separator", () => {
    render(
      <ButtonGroup>
        <ButtonGroupText>Label</ButtonGroupText>
        <ButtonGroupSeparator orientation="horizontal" />
      </ButtonGroup>
    )

    expect(screen.getByText("Label")).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="button-group-separator"]')
    ).toBeInTheDocument()
  })

  it("supports asChild for ButtonGroupText", () => {
    render(
      <ButtonGroupText asChild>
        <span>Child</span>
      </ButtonGroupText>
    )

    expect(screen.getByText("Child")).toBeInTheDocument()
  })
})
