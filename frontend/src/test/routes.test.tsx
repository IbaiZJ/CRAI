import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from '../routes';

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

  it('contains signup route', () => {
    const signupRoute = routes.find(route => route.path === '/signup');
    expect(signupRoute).toBeDefined();
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
});
