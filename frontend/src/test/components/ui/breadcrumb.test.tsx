import { render, screen } from "@testing-library/react"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

describe("Breadcrumb", () => {
  it("renders breadcrumb structure", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )

    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Current")).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="breadcrumb-separator"]')
    ).toBeInTheDocument()
  })

  it("supports asChild link and ellipsis", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <span>Root</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbList>
      </Breadcrumb>
    )

    const link = screen.getByText("Root")
    expect(link.getAttribute("data-slot")).toBe("breadcrumb-link")
    expect(
      document.querySelector('[data-slot="breadcrumb-ellipsis"]')
    ).toBeInTheDocument()
  })
})
