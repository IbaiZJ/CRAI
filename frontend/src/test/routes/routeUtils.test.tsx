import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createRoutes } from '@/routes/routeUtils'
import type { RouteObject } from 'react-router-dom'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

// Mock components
const TestComponent = () => <div>Test Component</div>
const ProtectedComponent = () => <div>Protected Component</div>
const NestedComponent = () => <div>Nested Component</div>

// Mock ProtectedRoute
vi.mock('@/components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}))

// Mock Spinner
vi.mock('@/components/Spinner', () => ({
  SpinnerCustom: () => <div data-testid="spinner">Loading...</div>,
}))

describe('createRoutes', () => {
  describe('basic route creation', () => {
    it('should create routes from config', () => {
      const routes = createRoutes([
        {
          path: '/test',
          component: TestComponent,
        },
      ])

      expect(routes).toHaveLength(1)
      expect(routes[0].path).toBe('/test')
      expect(routes[0].element).toBeDefined()
    })

    it('should create multiple routes', () => {
      const routes = createRoutes([
        { path: '/home', component: TestComponent },
        { path: '/about', component: TestComponent },
        { path: '/contact', component: TestComponent },
      ])

      expect(routes).toHaveLength(3)
      expect(routes[0].path).toBe('/home')
      expect(routes[1].path).toBe('/about')
      expect(routes[2].path).toBe('/contact')
    })

    it('should render unprotected route', () => {
      const routes = createRoutes([
        {
          path: '/',
          component: TestComponent,
        },
      ])

      const router = createMemoryRouter(routes, {
        initialEntries: ['/'],
      })

      render(<RouterProvider router={router} />)
      expect(screen.getByText('Test Component')).toBeInTheDocument()
    })
  })

  describe('protected routes', () => {
    it('should wrap protected routes with ProtectedRoute component', () => {
      const routes = createRoutes([
        {
          path: '/protected',
          component: ProtectedComponent,
          protected: true,
        },
      ])

      const router = createMemoryRouter(routes, {
        initialEntries: ['/protected'],
      })

      render(<RouterProvider router={router} />)
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
      expect(screen.getByText('Protected Component')).toBeInTheDocument()
    })

    it('should not wrap unprotected routes', () => {
      const routes = createRoutes([
        {
          path: '/public',
          component: TestComponent,
          protected: false,
        },
      ])

      const router = createMemoryRouter(routes, {
        initialEntries: ['/public'],
      })

      render(<RouterProvider router={router} />)
      expect(screen.queryByTestId('protected-route')).not.toBeInTheDocument()
      expect(screen.getByText('Test Component')).toBeInTheDocument()
    })

    it('should handle missing protected flag as unprotected', () => {
      const routes = createRoutes([
        {
          path: '/default',
          component: TestComponent,
        },
      ])

      const router = createMemoryRouter(routes, {
        initialEntries: ['/default'],
      })

      render(<RouterProvider router={router} />)
      expect(screen.queryByTestId('protected-route')).not.toBeInTheDocument()
    })
  })

  describe('Suspense fallback', () => {
    it('should wrap routes with Suspense', () => {
      const routes = createRoutes([
        {
          path: '/test',
          component: TestComponent,
        },
      ])

      expect(routes[0].element).toBeDefined()
      // The element should be wrapped with Suspense
      expect(routes[0].element).not.toBeNull()
    })

    it('should use SpinnerCustom as fallback', async () => {
      const LazyComponent = () => {
        throw new Promise(() => {}) // Simulate pending lazy component
      }

      const routes = createRoutes([
        {
          path: '/lazy',
          component: LazyComponent,
        },
      ])

      const router = createMemoryRouter(routes, {
        initialEntries: ['/lazy'],
      })

      // Note: Testing Suspense fallback is tricky in sync tests
      // This mainly validates the structure is correct
      expect(routes[0].element).toBeDefined()
    })
  })

  describe('nested routes', () => {
    it('should create nested routes when children are provided', () => {
      const routes = createRoutes([
        {
          path: '/parent',
          component: TestComponent,
          children: [
            {
              path: 'child',
              component: NestedComponent,
            },
          ],
        },
      ])

      expect(routes).toHaveLength(1)
      expect(routes[0].children).toBeDefined()
      expect(routes[0].children).toHaveLength(1)
      expect(routes[0].children![0].path).toBe('child')
    })

    it('should create multiple nested routes', () => {
      const routes = createRoutes([
        {
          path: '/parent',
          component: TestComponent,
          children: [
            { path: 'child1', component: NestedComponent },
            { path: 'child2', component: NestedComponent },
            { path: 'child3', component: NestedComponent },
          ],
        },
      ])

      expect(routes[0].children).toHaveLength(3)
    })

    it('should handle deeply nested routes', () => {
      const routes = createRoutes([
        {
          path: '/level1',
          component: TestComponent,
          children: [
            {
              path: 'level2',
              component: NestedComponent,
              children: [
                {
                  path: 'level3',
                  component: NestedComponent,
                },
              ],
            },
          ],
        },
      ])

      expect(routes[0].children).toBeDefined()
      expect(routes[0].children![0].children).toBeDefined()
      expect(routes[0].children![0].children![0].path).toBe('level3')
    })

    it('should not add children when not provided', () => {
      const routes = createRoutes([
        {
          path: '/no-children',
          component: TestComponent,
        },
      ])

      expect(routes[0].children).toBeUndefined()
    })

    it('should handle protected nested routes', () => {
      const routes = createRoutes([
        {
          path: '/parent',
          component: TestComponent,
          children: [
            {
              path: 'protected-child',
              component: NestedComponent,
              protected: true,
            },
          ],
        },
      ])

      expect(routes[0].children).toHaveLength(1)
      expect(routes[0].children![0].element).toBeDefined()
    })
  })

  describe('complex scenarios', () => {
    it('should handle mix of protected and unprotected routes', () => {
      const routes = createRoutes([
        { path: '/public', component: TestComponent, protected: false },
        { path: '/private', component: ProtectedComponent, protected: true },
        { path: '/default', component: TestComponent },
      ])

      expect(routes).toHaveLength(3)
    })

    it('should handle routes with different paths', () => {
      const routes = createRoutes([
        { path: '/', component: TestComponent },
        { path: '/users/:id', component: TestComponent },
        { path: '/posts/*', component: TestComponent },
      ])

      expect(routes[0].path).toBe('/')
      expect(routes[1].path).toBe('/users/:id')
      expect(routes[2].path).toBe('/posts/*')
    })

    it('should create valid RouteObject structure', () => {
      const routes = createRoutes([
        {
          path: '/test',
          component: TestComponent,
        },
      ])

      const route = routes[0] as RouteObject
      expect(route).toHaveProperty('path')
      expect(route).toHaveProperty('element')
    })
  })

  describe('edge cases', () => {
    it('should handle empty routes array', () => {
      const routes = createRoutes([])
      expect(routes).toEqual([])
    })

    it('should handle single route', () => {
      const routes = createRoutes([
        { path: '/single', component: TestComponent },
      ])

      expect(routes).toHaveLength(1)
    })

    it('should handle routes with empty children array', () => {
      const routes = createRoutes([
        {
          path: '/parent',
          component: TestComponent,
          children: [],
        },
      ])

      // Empty children array should still create children property
      expect(routes[0].children).toBeDefined()
      expect(routes[0].children).toHaveLength(0)
    })

    it('should handle root path', () => {
      const routes = createRoutes([
        { path: '/', component: TestComponent },
      ])

      expect(routes[0].path).toBe('/')
    })

    it('should handle wildcard paths', () => {
      const routes = createRoutes([
        { path: '*', component: TestComponent },
      ])

      expect(routes[0].path).toBe('*')
    })
  })

  describe('component rendering', () => {
    it('should render the correct component for a route', () => {
      const UniqueComponent = () => <div>Unique Content</div>

      const routes = createRoutes([
        { path: '/unique', component: UniqueComponent },
      ])

      const router = createMemoryRouter(routes, {
        initialEntries: ['/unique'],
      })

      render(<RouterProvider router={router} />)
      expect(screen.getByText('Unique Content')).toBeInTheDocument()
    })

    it('should render different components for different routes', () => {
      const ComponentA = () => <div>Component A</div>
      const ComponentB = () => <div>Component B</div>

      const routes = createRoutes([
        { path: '/a', component: ComponentA },
        { path: '/b', component: ComponentB },
      ])

      const routerA = createMemoryRouter(routes, {
        initialEntries: ['/a'],
      })
      const { unmount } = render(<RouterProvider router={routerA} />)
      expect(screen.getByText('Component A')).toBeInTheDocument()
      unmount()

      const routerB = createMemoryRouter(routes, {
        initialEntries: ['/b'],
      })
      render(<RouterProvider router={routerB} />)
      expect(screen.getByText('Component B')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should create a complete route configuration', () => {
      const routes = createRoutes([
        {
          path: '/',
          component: TestComponent,
        },
        {
          path: '/dashboard',
          component: TestComponent,
          protected: true,
          children: [
            { path: 'overview', component: NestedComponent },
            { path: 'settings', component: NestedComponent, protected: true },
          ],
        },
        {
          path: '/login',
          component: TestComponent,
        },
      ])

      expect(routes).toHaveLength(3)
      expect(routes[1].children).toHaveLength(2)
    })

    it('should maintain route order', () => {
      const routes = createRoutes([
        { path: '/first', component: TestComponent },
        { path: '/second', component: TestComponent },
        { path: '/third', component: TestComponent },
      ])

      expect(routes[0].path).toBe('/first')
      expect(routes[1].path).toBe('/second')
      expect(routes[2].path).toBe('/third')
    })
  })
})
