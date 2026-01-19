import { render, screen } from "@testing-library/react"
import { vi } from "vitest"

vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn((_targets, _from, to) => {
      if (to?.onComplete) {
        to.onComplete()
      }
      return {}
    }),
  },
}))

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    getAll: () => [],
  },
}))

vi.mock("gsap/SplitText", () => ({
  SplitText: class {
    chars: Element[] = []
    words: Element[] = []
    lines: Element[] = []

    constructor(el: Element, opts: any) {
      this.chars = [el]
      this.words = [el]
      this.lines = [el]
      if (opts?.onSplit) {
        opts.onSplit(this)
      }
    }

    revert() {}
  },
}))

vi.mock("@gsap/react", async () => {
  const React = await import("react")
  return {
    useGSAP: (cb: () => void) => {
      React.useEffect(() => cb(), [])
    },
  }
})

import SplitText from "@/components/SplitText"

describe("SplitText", () => {
  beforeEach(() => {
    Object.defineProperty(document, "fonts", {
      value: { status: "loaded", ready: Promise.resolve() },
      configurable: true,
    })
  })

  it("renders default tag and triggers completion callback", () => {
    const onComplete = vi.fn()
    render(<SplitText text="Hello" onLetterAnimationComplete={onComplete} />)

    expect(screen.getByText("Hello").tagName).toBe("P")
    expect(onComplete).toHaveBeenCalled()
  })

  it("renders custom tag", () => {
    render(<SplitText text="Title" tag="h1" rootMargin="-50px" />)
    expect(screen.getByText("Title").tagName).toBe("H1")
  })
})
