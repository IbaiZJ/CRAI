import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogOutDialog } from '@/components/dialogs/LogOutDialog';
import { BrowserRouter } from 'react-router-dom';

// Mock hooks
const mockLogout = vi.fn();
const mockNavigate = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ logout: mockLogout })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    success: mockSuccess,
    error: mockError
  })
}));

describe('LogOutDialog', () => {
  it('should render confirmation message when open', () => {
    render(
      <BrowserRouter>
        <LogOutDialog open={true} onOpenChange={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText('Are you sure you want to log out?')).toBeInTheDocument();
  });

  it('should call logout and navigate on confirm', () => {
    render(
      <BrowserRouter>
        <LogOutDialog open={true} onOpenChange={vi.fn()} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Log Out'));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(mockSuccess).toHaveBeenCalledWith('Logged out successfully');
  });
});
