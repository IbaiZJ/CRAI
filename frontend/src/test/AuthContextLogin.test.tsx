import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Create a test component that exposes login function properly
const createTestWrapper = () => {
  let loginFn: ((credential: string) => void) | null = null;
  let logoutFn: (() => void) | null = null;

  const TestComponent = () => {
    const { AuthProvider, useAuth } = require('@/contexts/AuthContext');
    
    const Inner = () => {
      const { user, isAuthenticated, login, logout, loading } = useAuth();
      loginFn = login;
      logoutFn = logout;
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'true' : 'false'}</div>
          <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          {user && (
            <>
              <div data-testid="user-email">{user.email}</div>
              <div data-testid="user-name">{user.fullName}</div>
            </>
          )}
        </div>
      );
    };

    return (
      <BrowserRouter>
        <AuthProvider>
          <Inner />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  return { TestComponent, getLogin: () => loginFn, getLogout: () => logoutFn };
};

describe('AuthContext - Login function', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('should decode JWT and create user on login', async () => {
    // Valid JWT with proper structure (header.payload.signature)
    // payload: {"email":"test@example.com","name":"Test User","given_name":"Test","family_name":"User","sub":"123456","exp":9999999999,"iat":1700000000}
    const validToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiZ2l2ZW5fbmFtZSI6IlRlc3QiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJzdWIiOiIxMjM0NTYiLCJleHAiOjk5OTk5OTk5OTksImlhdCI6MTcwMDAwMDAwMH0.signature';

    const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

    let loginFn: ((credential: string) => void) | null = null;

    const Inner = () => {
      const { user, isAuthenticated, login } = useAuth();
      loginFn = login;
      
      return (
        <div>
          <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
          {user && <div data-testid="user-email">{user.email}</div>}
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

    // Call login
    if (loginFn) {
      loginFn(validToken);
    }

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(localStorage.getItem('token')).toBe(validToken);
    expect(localStorage.getItem('user')).toBeTruthy();
  });

  it('should handle invalid token in login gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

    let loginFn: ((credential: string) => void) | null = null;

    const Inner = () => {
      const { user, isAuthenticated, login } = useAuth();
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

    // Call login with invalid token
    if (loginFn) {
      loginFn('invalid-token');
    }

    // Should still be not authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should logout and clear localStorage', async () => {
    // Start with a valid token
    const validToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiZ2l2ZW5fbmFtZSI6IlRlc3QiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJzdWIiOiIxMjM0NTYiLCJleHAiOjk5OTk5OTk5OTksImlhdCI6MTcwMDAwMDAwMH0.signature';

    const { AuthProvider, useAuth } = await import('@/contexts/AuthContext');

    let loginFn: ((credential: string) => void) | null = null;
    let logoutFn: (() => void) | null = null;

    const Inner = () => {
      const { user, isAuthenticated, login, logout } = useAuth();
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

    // Login first
    if (loginFn) {
      loginFn(validToken);
    }

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Now logout
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
