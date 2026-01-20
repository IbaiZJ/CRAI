import { vi } from "vitest"

const renderMock = vi.fn()
const createRootMock = vi.fn(() => ({ render: renderMock }))

vi.mock("../index.css", () => ({}))

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}))

vi.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }: any) => children,
}))

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: any) => children,
}))

vi.mock("../App.tsx", () => ({
  default: () => <div>App</div>,
}))

vi.mock("../contexts/AuthContext", () => ({
  AuthProvider: ({ children }: any) => children,
}))

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div>Toaster</div>,
}))

vi.mock("../lib/google-oauth.ts", () => ({
  GOOGLE_CLIENT_ID: "test-id",
}))

describe("main entry", () => {
  it("creates root and renders app", async () => {
    document.body.innerHTML = '<div id="root"></div>'
    await import("../main")
    expect(createRootMock).toHaveBeenCalled()
    expect(renderMock).toHaveBeenCalled()
  })
})
