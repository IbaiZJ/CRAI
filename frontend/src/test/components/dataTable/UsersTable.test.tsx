import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UsersTable from '@/components/dataTable/UsersTable';

describe('UsersTable', () => {
  it('should render user data', () => {
    const mockData = [
      {
        username: 'testuser',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      }
    ];

    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <UsersTable
        data={mockData}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });
});
