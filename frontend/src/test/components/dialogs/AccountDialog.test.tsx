import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountDialog } from '@/components/dialogs/AccountDialog';

describe('AccountDialog', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'avatar.jpg'
  };

  it('should render user information when open', () => {
    render(
      <AccountDialog
        open={true}
        onOpenChange={vi.fn()}
        user={mockUser}
        initials="JD"
      />
    );

    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <AccountDialog
        open={false}
        onOpenChange={vi.fn()}
        user={mockUser}
        initials="JD"
      />
    );

    expect(screen.queryByText('Account Information')).not.toBeInTheDocument();
  });
});
