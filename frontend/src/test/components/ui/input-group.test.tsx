import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupText,
} from "@/components/ui/input-group"

describe("InputGroup", () => {
  it("focuses input when addon is clicked", async () => {
    const user = userEvent.setup()
    render(
      <InputGroup>
        <InputGroupAddon>Addon</InputGroupAddon>
        <InputGroupInput aria-label="field" />
      </InputGroup>
    )

    await user.click(screen.getByText("Addon"))
    expect(screen.getByLabelText("field")).toHaveFocus()
  })

  it("does not steal focus when clicking a button inside addon", async () => {
    const user = userEvent.setup()
    render(
      <InputGroup>
        <InputGroupAddon>
          <button type="button">Btn</button>
        </InputGroupAddon>
        <InputGroupInput aria-label="field" />
      </InputGroup>
    )

    await user.click(screen.getByRole("button", { name: "Btn" }))
    expect(screen.getByLabelText("field")).not.toHaveFocus()
  })

  it("renders button and text", () => {
    render(
      <InputGroup>
        <InputGroupText>Label</InputGroupText>
        <InputGroupButton size="sm">Action</InputGroupButton>
      </InputGroup>
    )

    const button = screen.getByRole("button", { name: "Action" })
    expect(button).toHaveAttribute("data-size", "sm")
    expect(screen.getByText("Label")).toBeInTheDocument()
  })

  it("renders textarea control", () => {
    render(
      <InputGroup>
        <InputGroupTextarea aria-label="message" />
      </InputGroup>
    )
    expect(screen.getByLabelText("message")).toBeInTheDocument()
  })
})
