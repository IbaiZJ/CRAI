import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    expect(document.title).toBe('CRAI - Users');
  });
});
