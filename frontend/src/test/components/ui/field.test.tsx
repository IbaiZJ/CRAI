import { render, screen } from "@testing-library/react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"

describe("Field", () => {
  it("renders field layout", () => {
    render(
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Label</FieldLabel>
            <FieldDescription>Description</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    )

    expect(screen.getByText("Label")).toBeInTheDocument()
    expect(screen.getByText("Description")).toBeInTheDocument()
  })

  it("renders separator with content", () => {
    render(<FieldSeparator>OR</FieldSeparator>)
    expect(screen.getByText("OR")).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="field-separator-content"]')
    ).toBeInTheDocument()
  })

  it("handles error content variations", () => {
    const { rerender } = render(<FieldError />)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()

    rerender(<FieldError errors={[{ message: "One" }]} />)
    expect(screen.getByText("One")).toBeInTheDocument()

    rerender(
      <FieldError errors={[{ message: "A" }, { message: "A" }, { message: "B" }]} />
    )
    expect(screen.getByText("A")).toBeInTheDocument()
    expect(screen.getByText("B")).toBeInTheDocument()

    rerender(<FieldError>Custom</FieldError>)
    expect(screen.getByText("Custom")).toBeInTheDocument()
  })
})
