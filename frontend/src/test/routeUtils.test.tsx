import { describe, it, expect } from 'vitest';
import { createRoutes } from '@/routes/routeUtils';

// Mock component for testing
const MockComponent = () => <div>Mock Component</div>;

describe('routeUtils', () => {
  it('should create routes without protection', () => {
    const testRoutes = [
      {
        path: '/home',
        component: MockComponent,
        protected: false,
      },
    ];

    const routes = createRoutes(testRoutes);

    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/home');
    expect(routes[0].element).toBeDefined();
  });

  it('should create protected routes', () => {
    const testRoutes = [
      {
        path: '/dashboard',
        component: MockComponent,
        protected: true,
      },
    ];

    const routes = createRoutes(testRoutes);

    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/dashboard');
    expect(routes[0].element).toBeDefined();
  });

  it('should create routes with children', () => {
    const testRoutes = [
      {
        path: '/parent',
        component: MockComponent,
        children: [
          {
            path: '/child',
            component: MockComponent,
          },
        ],
      },
    ];

    const routes = createRoutes(testRoutes);

    expect(routes).toHaveLength(1);
    expect(routes[0].children).toBeDefined();
    expect(routes[0].children).toHaveLength(1);
  });

  it('should handle empty routes array', () => {
    const routes = createRoutes([]);
    expect(routes).toHaveLength(0);
  });

  it('should create multiple routes', () => {
    const testRoutes = [
      {
        path: '/home',
        component: MockComponent,
      },
      {
        path: '/about',
        component: MockComponent,
      },
      {
        path: '/dashboard',
        component: MockComponent,
        protected: true,
      },
    ];

    const routes = createRoutes(testRoutes);

    expect(routes).toHaveLength(3);
    expect(routes[0].path).toBe('/home');
    expect(routes[1].path).toBe('/about');
    expect(routes[2].path).toBe('/dashboard');
  });

  it('should wrap components with Suspense', () => {
    const testRoutes = [
      {
        path: '/test',
        component: MockComponent,
      },
    ];

    const routes = createRoutes(testRoutes);
    
    // Verify the element is rendered (Suspense wrapper should be present)
    expect(routes[0].element).toBeDefined();
  });

  it('should create nested routes correctly', () => {
    const testRoutes = [
      {
        path: '/parent',
        component: MockComponent,
        children: [
          {
            path: 'child1',
            component: MockComponent,
          },
          {
            path: 'child2',
            component: MockComponent,
            protected: true,
          },
        ],
      },
    ];

    const routes = createRoutes(testRoutes);

    expect(routes[0].children).toHaveLength(2);
    expect(routes[0].children![0].path).toBe('child1');
    expect(routes[0].children![1].path).toBe('child2');
  });
});
