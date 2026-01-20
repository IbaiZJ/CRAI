import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { routes } from '../routes';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

vi.mock('@/pages/Home', () => ({ default: () => <div>Home Page</div> }));
vi.mock('@/pages/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('@/pages/SignUp', () => ({ default: () => <div>SignUp Page</div> }));
vi.mock('@/pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('@/pages/Users', () => ({ default: () => <div>Users Page</div> }));
vi.mock('@/pages/User', () => ({ default: () => <div>User Page</div> }));
vi.mock('@/pages/Statistics', () => ({ default: () => <div>Statistics Page</div> }));
vi.mock('@/pages/Cameras', () => ({ default: () => <div>Cameras Page</div> }));
vi.mock('@/pages/Cars', () => ({ default: () => <div>Cars Page</div> }));
vi.mock('@/pages/Simulations', () => ({ default: () => <div>Simulations Page</div> }));
vi.mock('@/pages/NotFound', () => ({ default: () => <div>NotFound Page</div> }));

describe('Routes', () => {
  it('exports routes array', () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
  });

  it('contains home route', () => {
    const homeRoute = routes.find(route => route.path === '/');
    expect(homeRoute).toBeDefined();
  });

  it('contains login route', () => {
    const loginRoute = routes.find(route => route.path === '/login');
    expect(loginRoute).toBeDefined();
  });

  it('contains users route', () => {
    const usersRoute = routes.find(route => route.path === '/users');
    expect(usersRoute).toBeDefined();
  });

  it('contains dashboard route', () => {
    const dashboardRoute = routes.find(route => route.path === '/dashboard');
    expect(dashboardRoute).toBeDefined();
  });

  it('renders routes correctly', () => {
    render(
      <BrowserRouter>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </BrowserRouter>
    );
    
    // Verifica que el router se renderiza sin errores
    expect(document.body).toBeInTheDocument();
  });

  it('renders lazy routes for each path', async () => {
    const cases = [
      { path: '/', text: 'Home Page' },
      { path: '/login', text: 'Login Page' },
      { path: '/signup', text: 'SignUp Page' },
      { path: '/dashboard', text: 'Dashboard Page' },
      { path: '/users', text: 'Users Page' },
      { path: '/users/123', text: 'User Page' },
      { path: '/statistics', text: 'Statistics Page' },
      { path: '/cameras', text: 'Cameras Page' },
      { path: '/cars', text: 'Cars Page' },
      { path: '/simulations', text: 'Simulations Page' },
      { path: '/unknown', text: 'NotFound Page' },
    ];

    for (const testCase of cases) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[testCase.path]}>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(testCase.text)).toBeInTheDocument();
      unmount();
    }
  });
});
