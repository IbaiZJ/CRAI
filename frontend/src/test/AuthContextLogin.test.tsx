import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

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

    let loginFn: any = null;

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
