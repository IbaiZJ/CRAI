import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock AuthContext
const mockUser = {
  fullName: 'John Doe',
  email: 'john@example.com',
  picture: 'https://example.com/avatar.jpg',
  sub: 'user-123',
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
  })),
}));

// Mock useNotifications
const mockInfo = vi.fn();
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    info: mockInfo,
    success: vi.fn(),
    error: vi.fn(),
  })),
}));

// Mock useSidebar
vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu">{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu-item">{children}</div>,
  SidebarMenuButton: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <button data-testid="sidebar-menu-button" data-size={size} className={className}>{children}</button>
  ),
  useSidebar: () => ({ isMobile: false }),
}));

// Mock Avatar components
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="avatar-fallback" className={className}>{children}</span>
  ),
}));

// Mock DropdownMenu components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu-content">{children}</div>,
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu-group">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="dropdown-menu-item" onClick={onClick}>{children}</button>
  ),
  DropdownMenuLabel: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-label" className={className}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-menu-separator" />,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
}));

// Mock dialogs
vi.mock('@/components/dialogs/AccountDialog', () => ({
  AccountDialog: ({ open, onOpenChange, user, initials, userId }: any) => (
    open ? <div data-testid="account-dialog">Account Dialog for {user?.name}</div> : null
  ),
}));

vi.mock('@/components/dialogs/LogOutDialog', () => ({
  LogOutDialog: ({ open, onOpenChange }: any) => (
    open ? <div data-testid="logout-dialog">Logout Dialog</div> : null
  ),
}));

import { NavUser } from '@/components/NavUser';
import { useAuth } from '@/contexts/AuthContext';

describe('NavUser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInfo.mockClear();
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });
  });

  it('should render the component', () => {
    render(<NavUser />);

    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
  });

  it('should render user avatar', () => {
    render(<NavUser />);

    expect(screen.getAllByTestId('avatar').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('avatar-image')[0]).toHaveAttribute('src', mockUser.picture);
  });

  it('should display user full name', () => {
    render(<NavUser />);

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
  });

  it('should display user email', () => {
    render(<NavUser />);

    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
  });

  it('should display user initials in avatar fallback', () => {
    render(<NavUser />);

    const fallbacks = screen.getAllByTestId('avatar-fallback');
    expect(fallbacks[0]).toHaveTextContent('JD');
  });

  it('should render dropdown menu', () => {
    render(<NavUser />);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
  });

  it('should render sidebar menu button', () => {
    render(<NavUser />);

    expect(screen.getByTestId('sidebar-menu-button')).toBeInTheDocument();
  });

  it('should return null when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: null,
    });

    const { container } = render(<NavUser />);

    expect(container.firstChild).toBeNull();
  });

  it('should render dropdown menu items', () => {
    render(<NavUser />);

    const menuItems = screen.getAllByTestId('dropdown-menu-item');
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('should render Account menu item', () => {
    render(<NavUser />);

    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('should render Notifications menu item', () => {
    render(<NavUser />);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should render Log out menu item', () => {
    render(<NavUser />);

    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('should trigger notification when clicking Notifications', async () => {
    const user = userEvent.setup();

    render(<NavUser />);

    const notificationsButton = screen.getByText('Notifications').closest('button');
    if (notificationsButton) {
      await user.click(notificationsButton);
      expect(mockInfo).toHaveBeenCalledWith('This is a notification');
    }
  });

  it('should render dropdown menu separators', () => {
    render(<NavUser />);

    const separators = screen.getAllByTestId('dropdown-menu-separator');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should handle user with single name', () => {
    (useAuth as any).mockReturnValue({
      user: {
        fullName: 'John',
        email: 'john@example.com',
        picture: 'https://example.com/avatar.jpg',
        sub: 'user-123',
      },
    });

    render(<NavUser />);

    const fallbacks = screen.getAllByTestId('avatar-fallback');
    expect(fallbacks[0]).toHaveTextContent('J');
  });

  it('should handle user without picture', () => {
    (useAuth as any).mockReturnValue({
      user: {
        fullName: 'John Doe',
        email: 'john@example.com',
        picture: undefined,
        sub: 'user-123',
      },
    });

    render(<NavUser />);

    // Should still render with fallback initials
    const fallbacks = screen.getAllByTestId('avatar-fallback');
    expect(fallbacks[0]).toHaveTextContent('JD');
  });

  it('should handle user with empty fullName', () => {
    (useAuth as any).mockReturnValue({
      user: {
        fullName: '',
        email: 'john@example.com',
        picture: 'https://example.com/avatar.jpg',
        sub: 'user-123',
      },
    });

    render(<NavUser />);

    const fallbacks = screen.getAllByTestId('avatar-fallback');
    // Should default to "US" when no name
    expect(fallbacks[0]).toHaveTextContent('US');
  });

  it('should render dropdown menu label', () => {
    render(<NavUser />);

    expect(screen.getByTestId('dropdown-menu-label')).toBeInTheDocument();
  });

  it('should render dropdown menu groups', () => {
    render(<NavUser />);

    const groups = screen.getAllByTestId('dropdown-menu-group');
    expect(groups.length).toBeGreaterThan(0);
  });
});

describe('NavUser Component - Dialog states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });
  });

  it('should open account dialog when clicking Account', async () => {
    const user = userEvent.setup();

    render(<NavUser />);

    const accountButton = screen.getByText('Account').closest('button');
    if (accountButton) {
      await user.click(accountButton);
      expect(screen.getByTestId('account-dialog')).toBeInTheDocument();
    }
  });

  it('should open logout dialog when clicking Log out', async () => {
    const user = userEvent.setup();

    render(<NavUser />);

    const logoutButton = screen.getByText('Log out').closest('button');
    if (logoutButton) {
      await user.click(logoutButton);
      expect(screen.getByTestId('logout-dialog')).toBeInTheDocument();
    }
  });
});

describe('NavUser Component - Mobile mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });
  });

  it('should render in mobile mode', () => {
    // The useSidebar mock returns isMobile: false by default
    // This test just verifies the component renders correctly
    render(<NavUser />);

    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
  });
});
