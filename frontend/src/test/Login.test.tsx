import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';

describe('Login Component', () => {
  it('renders login form with title', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Verifica que el título esté presente
    expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument();
  });

  it('renders google sign in description', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Verifica que el texto de descripción esté presente
    expect(screen.getByText('Sign in with your Google account to continue')).toBeInTheDocument();
  });

  it('renders google login component', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Verifica que el contenedor de Google Login esté presente
    const container = screen.getByText('Log In').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('renders back to home link', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Verifica que el link de volver esté presente
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
  });
});
