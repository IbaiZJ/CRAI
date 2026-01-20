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

  it('should show error when user load throws', async () => {
    const originalTitle = Object.getOwnPropertyDescriptor(document, 'title');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Object.defineProperty(document, 'title', {
      configurable: true,
      get: () => '',
      set: (value: string) => {
        if (value.startsWith('CRAI - User')) {
          throw new Error('boom');
        }
      },
    });

    render(
      <MemoryRouter initialEntries={['/users/999']} >
        <Routes>
          <Route path="/users/:id" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
    if (originalTitle) {
      Object.defineProperty(document, 'title', originalTitle);
    }
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

describe('UserDetail Page - Missing data fallbacks', () => {
  it('should show default message when user is null without error', async () => {
    const originalTitle = Object.getOwnPropertyDescriptor(document, 'title');
    vi.resetModules();
    vi.doMock('react', async () => {
      const actual = await vi.importActual<typeof import('react')>('react');
      return {
        ...actual,
        useState: vi.fn()
          .mockImplementationOnce(() => [null, vi.fn()] as any)
          .mockImplementationOnce(() => [false, vi.fn()] as any)
          .mockImplementationOnce(() => [null, vi.fn()] as any),
      };
    });

    const { default: UserDetailMocked } = await import('@/pages/User');

    Object.defineProperty(document, 'title', {
      configurable: true,
      get: () => '',
      set: () => {},
    });

    render(
      <MemoryRouter initialEntries={['/users/123']}>
        <Routes>
          <Route path="/users/:id" element={<UserDetailMocked />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("The user you're looking for doesn't exist.")).toBeInTheDocument();
    vi.doUnmock('react');
    vi.resetModules();
    if (originalTitle) {
      Object.defineProperty(document, 'title', originalTitle);
    }
  });

  it('should render N/A when user fields are missing', async () => {
    const originalTitle = Object.getOwnPropertyDescriptor(document, 'title');
    vi.resetModules();
    vi.doMock('react', async () => {
      const actual = await vi.importActual<typeof import('react')>('react');
      return {
        ...actual,
        useState: vi.fn()
          .mockImplementationOnce(() => [{ id: '123', name: '', email: '', role: '' }, vi.fn()] as any)
          .mockImplementationOnce(() => [false, vi.fn()] as any)
          .mockImplementationOnce(() => [null, vi.fn()] as any),
      };
    });

    const { default: UserDetailMocked } = await import('@/pages/User');

    Object.defineProperty(document, 'title', {
      configurable: true,
      get: () => '',
      set: () => {},
    });

    render(
      <MemoryRouter initialEntries={['/users/123']}>
        <Routes>
          <Route path="/users/:id" element={<UserDetailMocked />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getAllByText('N/A')).toHaveLength(3);
    vi.doUnmock('react');
    vi.resetModules();
    if (originalTitle) {
      Object.defineProperty(document, 'title', originalTitle);
    }
  });
});
