import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UsersTableExample from '@/components/dataTable/UsersTable';

// Mock the constants to have predictable data
vi.mock('@/constants/userConstant', () => ({
  users: [
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01'
    }
  ] as any
}));

describe('UsersTable', () => {
  it('should render user data', () => {
    render(<UsersTableExample />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
});
