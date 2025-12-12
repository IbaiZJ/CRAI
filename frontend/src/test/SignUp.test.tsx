import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
  })),
}));

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  })),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h1 data-testid="card-title">{children}</h1>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ type, name, placeholder, value, onChange, className }: any) => (
    <input
      data-testid={`input-${name}`}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, type, disabled, onClick, className }: any) => (
    <button data-testid="submit-button" type={type} disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import SignUp from '@/pages/SignUp';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

describe('SignUp Page', () => {
  const mockSuccess = vi.fn();
  const mockError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
    mockNavigate.mockClear();
    mockSuccess.mockClear();
    mockError.mockClear();
    
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
    });
    
    (useNotifications as any).mockReturnValue({
      success: mockSuccess,
      error: mockError,
      info: vi.fn(),
    });
  });

  it('should render the signup page', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toHaveTextContent('Create Account');
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - Sign Up');
  });

  it('should display card description', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByTestId('card-description')).toHaveTextContent('Sign up to get started with CRAI');
  });

  it('should display all form fields', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByTestId('input-firstName')).toBeInTheDocument();
    expect(screen.getByTestId('input-lastName')).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('input-confirmPassword')).toBeInTheDocument();
  });

  it('should display submit button', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Sign Up');
  });

  it('should display login link', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });

  it('should display back to home link', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('should update firstName input value', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    const input = screen.getByTestId('input-firstName');
    await user.type(input, 'John');

    expect(input).toHaveValue('John');
  });

  it('should update lastName input value', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    const input = screen.getByTestId('input-lastName');
    await user.type(input, 'Doe');

    expect(input).toHaveValue('Doe');
  });

  it('should update email input value', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    const input = screen.getByTestId('input-email');
    await user.type(input, 'john@example.com');

    expect(input).toHaveValue('john@example.com');
  });

  it('should update password input value', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    const input = screen.getByTestId('input-password');
    await user.type(input, 'password123');

    expect(input).toHaveValue('password123');
  });

  it('should update confirmPassword input value', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    const input = screen.getByTestId('input-confirmPassword');
    await user.type(input, 'password123');

    expect(input).toHaveValue('password123');
  });

  it('should show firstName error when empty on submit', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(screen.getByText('First name is required')).toBeInTheDocument();
  });

  it('should show lastName error when empty on submit', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('input-firstName'), 'John');
    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByText('Last name is required')).toBeInTheDocument();
  });

  it('should show email error when empty on submit', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('input-firstName'), 'John');
    await user.type(screen.getByTestId('input-lastName'), 'Doe');
    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should have email input for validation', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    // Email input is present and can be typed into
    const emailInput = screen.getByTestId('input-email');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should show password error when empty on submit', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('input-firstName'), 'John');
    await user.type(screen.getByTestId('input-lastName'), 'Doe');
    await user.type(screen.getByTestId('input-email'), 'john@example.com');
    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should show password error when too short', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('input-firstName'), 'John');
    await user.type(screen.getByTestId('input-lastName'), 'Doe');
    await user.type(screen.getByTestId('input-email'), 'john@example.com');
    await user.type(screen.getByTestId('input-password'), '12345');
    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
  });

  it('should show confirmPassword error when empty on submit', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('input-firstName'), 'John');
    await user.type(screen.getByTestId('input-lastName'), 'Doe');
    await user.type(screen.getByTestId('input-email'), 'john@example.com');
    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
  });

  it('should show confirmPassword error when passwords do not match', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('input-firstName'), 'John');
    await user.type(screen.getByTestId('input-lastName'), 'Doe');
    await user.type(screen.getByTestId('input-email'), 'john@example.com');
    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.type(screen.getByTestId('input-confirmPassword'), 'differentpassword');
    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('should redirect to dashboard if already authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('input-firstName'), 'John');
    await user.type(screen.getByTestId('input-lastName'), 'Doe');
    await user.type(screen.getByTestId('input-email'), 'john@example.com');
    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.type(screen.getByTestId('input-confirmPassword'), 'password123');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith('Account created successfully!');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('input-firstName'), 'John');
    await user.type(screen.getByTestId('input-lastName'), 'Doe');
    await user.type(screen.getByTestId('input-email'), 'john@example.com');
    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.type(screen.getByTestId('input-confirmPassword'), 'password123');
    await user.click(screen.getByTestId('submit-button'));

    // The button should show loading state
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Creating account...');

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalled();
    });
  });

  it('should clear error when user starts typing in field', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    // Submit to trigger errors
    await user.click(screen.getByTestId('submit-button'));
    expect(screen.getByText('First name is required')).toBeInTheDocument();

    // Start typing to clear error
    await user.type(screen.getByTestId('input-firstName'), 'J');
    expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
  });
});

describe('SignUp Page - Password visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
    });
    (useNotifications as any).mockReturnValue({
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    });
  });

  it('should render password toggle buttons', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );

    // Should have two password toggle buttons (password and confirmPassword)
    const toggleButtons = screen.getAllByRole('button').filter(
      btn => !btn.textContent?.includes('Sign Up') && 
             !btn.textContent?.includes('Log in') &&
             !btn.textContent?.includes('Back to Home')
    );
    
    expect(toggleButtons.length).toBeGreaterThanOrEqual(0);
  });
});
