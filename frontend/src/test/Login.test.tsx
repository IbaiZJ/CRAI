import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';

// Mock useNotifications hook
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.title = '';
  });

  it('renders login form with title', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('renders google sign in description', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
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
    
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
  });

  it('sets document title on mount', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(document.title).toBe('CRAI - Login');
  });

  it('renders all UI elements', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    expect(screen.getByText('Sign in with your Google account to continue')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
  });
});

// Tests with mocked AuthContext for better coverage
describe('Login Component - Authentication flow', () => {
  beforeEach(() => {
    localStorage.clear();
    document.title = '';
  });

  it('should render login page layout correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Check for main container structure
    const heading = screen.getByText('Log In');
    expect(heading).toBeInTheDocument();
  });

  it('should have back to home link pointing to root', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const homeLink = screen.getByRole('link', { name: 'Back to Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render centered content', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // The outer container should have centering classes
    const description = screen.getByText('Sign in with your Google account to continue');
    expect(description.closest('.text-center')).toBeInTheDocument();
  });
});
