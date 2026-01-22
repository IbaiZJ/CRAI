import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/layouts/Layout', () => ({
  default: ({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs?: { label: string; to?: string }[] }) => (
    <div data-testid="layout">
      <nav data-testid="breadcrumbs">
        {breadcrumbs?.map((b, i) => (
          <span key={i} data-testid={`breadcrumb-${i}`}>
            {b.label}{b.to ? ` (${b.to})` : ''}
          </span>
        ))}
      </nav>
      {children}
    </div>
  ),
}));

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock('@/components/dataTable/UsersTable', () => ({
  default: ({ users, onEdit, onDelete }: any) => (
    <div data-testid="users-table">
      {users && users.length > 0 ? (
        users.map((user: any) => (
          <div key={user.username} data-testid={`user-row-${user.username}`}>
            <span>{user.username}</span>
            <span>{user.name}</span>
            <span>{user.surname}</span>
            <button onClick={() => onEdit(user)}>Edit</button>
            <button onClick={() => onDelete(user.username)}>Delete</button>
          </div>
        ))
      ) : (
        <div data-testid="no-users">No users</div>
      )}
    </div>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h3 data-testid="dialog-title">{children}</h3>,
  DialogTrigger: ({ children, asChild }: any) => asChild ? children : <span>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ id, name, value, onChange, placeholder, disabled, type }: any) => (
    <input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      data-testid={`input-${name || id}`}
    />
  ),
}));

const mockUsers = [
  { username: 'admin', name: 'Admin', surname: 'User' },
  { username: 'john', name: 'John', surname: 'Doe' },
  { username: 'jane', name: 'Jane', surname: 'Smith' },
];

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true, data: mockUsers }),
  });
});

import Users from '@/pages/Users';

describe('Users Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the users page', () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('should display page title', () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Users Management');
  });

  it('should display page description', () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    expect(screen.getByText('Manage system users and permissions')).toBeInTheDocument();
  });

  it('should have correct breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Dashboard (/dashboard)');
    expect(screen.getByTestId('breadcrumb-1')).toHaveTextContent('Users');
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - Users Management');
  });

  it('should render users table', async () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
  });

  it('should fetch users on mount', async () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });
  });

  it('should display add user button', () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    const addButton = screen.getAllByTestId('button').find(btn => btn.textContent?.includes('Add User'));
    expect(addButton).toBeInTheDocument();
  });

  it('should display users from API', async () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-row-admin')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-john')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-jane')).toBeInTheDocument();
    });
  });

  it('should handle API error gracefully', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  it('should handle empty users list', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-users')).toBeInTheDocument();
    });
  });

  it('should handle API returning unsuccessful response', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    });

    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  it('should render within layout with correct structure', () => {
    render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });
});
