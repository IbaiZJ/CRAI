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
    
    expect(screen.getAllByText('Log In')[0]).toBeInTheDocument();
  });

  it('renders username/password description', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Sign in with your username and password')).toBeInTheDocument();
  });

  it('renders username and password inputs', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
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
    
    expect(screen.getAllByText('Log In')[0]).toBeInTheDocument();
    expect(screen.getByText('Sign in with your username and password')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
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
    const heading = screen.getAllByText('Log In')[0];
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
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
    const description = screen.getByText('Sign in with your username and password');
    expect(description.closest('.text-center')).toBeInTheDocument();
  });
});
