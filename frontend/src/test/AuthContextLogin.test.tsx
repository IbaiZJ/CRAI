import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe('AuthContext - Login function', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create user on successful login', async () => {
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      token: 'token-123',
      user: {
        username: 'testuser',
        name: 'Test',
        surname: 'User',
      },
    });

    let loginFn: any = null;

    const Inner = () => {
      const { user, isAuthenticated, login } = useAuth();
      loginFn = login;
      
      return (
        <div>
          <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          {user && <div data-testid="user-username">{user.username}</div>}
        </div>
      );
    };

    render(
      <BrowserRouter>
        <AuthProvider>
          <Inner />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

    if (loginFn) {
      await loginFn('testuser', 'password');
    }

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user-username')).toHaveTextContent('testuser');
    expect(localStorage.getItem('token')).toBe('token-123');
    expect(localStorage.getItem('user')).toBeTruthy();
  });

  it('should handle failed login gracefully', async () => {
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, error: 'Invalid username or password' });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    let loginFn: any = null;

    const Inner = () => {
      const { isAuthenticated, login } = useAuth();
      loginFn = login;
      
      return (
        <div>
          <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
        </div>
      );
    };

    render(
      <BrowserRouter>
        <AuthProvider>
          <Inner />
        </AuthProvider>
      </BrowserRouter>
    );

    if (loginFn) {
      await loginFn('user', 'bad-password');
    }

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    consoleSpy.mockRestore();
  });

  it('should logout and clear localStorage', async () => {
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      token: 'token-logout',
      user: {
        username: 'logout-user',
        name: 'Logout',
        surname: 'User',
      },
    });

    let loginFn: any = null;
    let logoutFn: any = null;

    const Inner = () => {
      const { isAuthenticated, login, logout } = useAuth();
      loginFn = login;
      logoutFn = logout;
      
      return (
        <div>
          <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
        </div>
      );
    };

    render(
      <BrowserRouter>
        <AuthProvider>
          <Inner />
        </AuthProvider>
      </BrowserRouter>
    );

    if (loginFn) {
      await loginFn('logout-user', 'password');
    }

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    if (logoutFn) {
      logoutFn();
    }

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
