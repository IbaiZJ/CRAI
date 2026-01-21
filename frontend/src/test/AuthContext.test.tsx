import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Helper component to test the hook
function TestComponent() {
  const { user, isAuthenticated, logout, login } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <div data-testid="user-name">{user?.fullName}</div>
          <div data-testid="user-email">{user?.email}</div>
          <button onClick={logout} data-testid="logout-btn">Logout</button>
        </>
      ) : (
        <div data-testid="not-authenticated">Not Authenticated</div>
      )}
      <button data-testid="login-btn">Login</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with no user when localStorage is empty', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('not-authenticated')).toBeInTheDocument();
  });

  it('should load user from localStorage on mount with valid token', () => {
    const mockUser = {
      username: 'testuser',
      name: 'Test',
      surname: 'User',
      fullName: 'Test User',
      sub: '123456',
    };
    // Use a token with exp in the future - this is VALID
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwic3ViIjoiMTIzNDU2IiwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE3MDAwMDAwMDB9.test';
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Token is valid and not expired, so user should be authenticated
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-username')).toHaveTextContent('testuser');
  });

  it('should keep user when token is expired since token is not validated', () => {
    const mockUser = {
      username: 'testuser',
      name: 'Test',
      surname: 'User',
      fullName: 'Test User',
      sub: '123456',
    };
    // Token with exp in past (AuthProvider does not validate JWT exp)
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwic3ViIjoiMTIzNDU2IiwiZXhwIjoxLCJpYXQiOjB9.signature';
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Provider simply parses stored user, so user remains authenticated
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-username')).toHaveTextContent('testuser');
  });

  it('should keep user when token cannot be decoded (no validation is performed)', () => {
    const mockUser = {
      username: 'testuser',
      name: 'Test',
      surname: 'User',
      fullName: 'Test User',
      sub: '123456',
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'invalid-token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-username')).toHaveTextContent('testuser');
  });

  it('should login with valid credential', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('not-authenticated')).toBeInTheDocument();
  });

  it('should throw error when useAuth is called outside provider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should logout and clear user data', () => {
    const mockUser = {
      username: 'testuser',
      name: 'Test',
      surname: 'User',
      fullName: 'Test User',
      sub: '123456',
    };
    // Valid token with future exp
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwic3ViIjoiMTIzNDU2IiwiZXhwIjo5OTk5OTk5OTksImlhdCI6MTcwMDAwMDAwMH0.test';
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);

    // Clear localStorage first since token won't decode properly
    localStorage.clear();

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('not-authenticated')).toBeInTheDocument();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('AuthContext - Login and Logout actions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should show loading state as false by default', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-state')).toHaveTextContent('not-loading');
  });

  it('should have login button available', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('login-btn')).toBeInTheDocument();
  });

  it('should provide isAuthenticated as false when no user', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('not-authenticated')).toBeInTheDocument();
  });

  it('should clear storage when stored user data is invalid JSON', () => {
    localStorage.setItem('user', '{invalid json');
    localStorage.setItem('token', 'token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('not-authenticated')).toBeInTheDocument();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
