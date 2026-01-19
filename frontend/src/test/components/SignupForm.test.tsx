import { render, screen } from "@testing-library/react"

import { SignupForm } from "@/components/SignupForm"

describe("SignupForm", () => {
  it("renders signup fields", () => {
    render(<SignupForm />)

    expect(screen.getByText("Create an account")).toBeInTheDocument()
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument()
  })
})
