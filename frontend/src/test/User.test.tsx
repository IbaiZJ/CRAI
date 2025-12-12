import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('@/layouts/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('@/components/Spinner', () => ({
  SpinnerCustom: () => <div data-testid="spinner">Loading...</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import UserDetail from '@/pages/User';

describe('UserDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should render user details page', async () => {
    render(
      <MemoryRouter initialEntries={['/users/123']}>
        <Routes>
          <Route path="/users/:id" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument();
    });
  });

  it('should display user details after loading', async () => {
    render(
      <MemoryRouter initialEntries={['/users/123']}>
        <Routes>
          <Route path="/users/:id" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('User Details')).toBeInTheDocument();
    expect(screen.getByText('User ID: 123')).toBeInTheDocument();
    expect(screen.getByText('Mock User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('should show user role', async () => {
    render(
      <MemoryRouter initialEntries={['/users/123']}>
        <Routes>
          <Route path="/users/:id" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should navigate back when clicking Back to Users button', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/users/123']}>
        <Routes>
          <Route path="/users/:id" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to users/i });
    await user.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });

  it('should set document title with user ID', async () => {
    render(
      <MemoryRouter initialEntries={['/users/456']}>
        <Routes>
          <Route path="/users/:id" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(document.title).toBe('CRAI - User 456');
  });

  it('should show error when user ID is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/users/']}>
        <Routes>
          <Route path="/users/" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('User ID is missing')).toBeInTheDocument();
  });
});

describe('UserDetail Page - Error states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show User Not Found when error occurs', async () => {
    render(
      <MemoryRouter initialEntries={['/users/']}>
        <Routes>
          <Route path="/users/" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('User Not Found')).toBeInTheDocument();
  });

  it('should navigate back from error state', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/users/']}>
        <Routes>
          <Route path="/users/" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to users/i });
    await user.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });
});
