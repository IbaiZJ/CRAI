import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// Create mock functions
const mockLogin = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockNavigate = vi.fn();

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
  }),
}));

// Mock useNotifications
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    success: mockSuccess,
    error: mockError,
    info: vi.fn(),
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Google Login
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: { onSuccess: (resp: any) => void; onError: () => void }) => (
    <div data-testid="google-login">
      <button data-testid="success-btn" onClick={() => onSuccess({ credential: 'mock-token' })}>
        Mock Success
      </button>
      <button data-testid="success-no-credential-btn" onClick={() => onSuccess({})}>
        Mock Success No Credential
      </button>
      <button data-testid="error-btn" onClick={() => onError()}>
        Mock Error
      </button>
    </div>
  ),
}));

import Login from '@/pages/Login';

describe('Login Page - Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockClear();
    mockSuccess.mockClear();
    mockError.mockClear();
    mockNavigate.mockClear();
    document.title = '';
  });

  it('should call handleSuccess with credential', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    await user.click(screen.getByTestId('success-btn'));

    expect(mockLogin).toHaveBeenCalledWith('mock-token');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(mockSuccess).toHaveBeenCalledWith('Logged in successfully!');
  });

  it('should not call login when no credential', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    await user.click(screen.getByTestId('success-no-credential-btn'));

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should call handleError on login failure', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    await user.click(screen.getByTestId('error-btn'));

    expect(consoleSpy).toHaveBeenCalledWith('Login Failed');
    expect(mockError).toHaveBeenCalledWith('Login failed. Please try again.');

    consoleSpy.mockRestore();
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - Login');
  });

  it('should render google login component', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByTestId('google-login')).toBeInTheDocument();
  });

  it('should render back to home link', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });
});

describe('Login Page - Authenticated redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should render login page when not authenticated', () => {
    // By default, the mock returns isAuthenticated: false
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // The login page should render normally
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });
});
