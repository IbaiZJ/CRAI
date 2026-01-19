import { render, screen } from "@testing-library/react"

import { LoginForm } from "@/components/LoginForm"

describe("LoginForm", () => {
  it("renders login fields", () => {
    render(<LoginForm />)

    expect(screen.getByText("Login to your account")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Login with Google" })
    ).toBeInTheDocument()
  })
})
