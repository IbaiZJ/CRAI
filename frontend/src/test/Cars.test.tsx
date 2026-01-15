import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockVehicles = [
  { plate: 'ABC-1234', badge: 'VEH-001', userId: 1, itv: '2025-12-31' },
  { plate: 'XYZ-5678', badge: 'VEH-002', userId: 2, itv: '2025-11-30' },
  { plate: 'DEF-9012', badge: 'VEH-003', userId: 1, itv: '2025-10-15' },
  { plate: 'GHI-3456', badge: 'VEH-004', userId: 3, itv: '2025-09-20' },
  { plate: 'JKL-7890', badge: 'VEH-005', userId: 2, itv: '2025-08-10' },
  { plate: 'MNO-2345', badge: 'VEH-006', userId: 4, itv: '2024-01-01' }, // Expired
];

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockVehicles),
  })
) as any;

vi.mock('@/layouts/Layout', () => ({
  default: ({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs?: { label: string; to?: string }[] }) => (
    <div data-testid="layout">
      <nav data-testid="breadcrumbs">
        {breadcrumbs?.map((b, i) => (
          <span key={i} data-testid={`breadcrumb-${i}`}>{b.label}</span>
        ))}
      </nav>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="card-title">{children}</h3>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}));

import Cars from '@/pages/Cars';

describe('Cars Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
  });

  it('should render the cars page', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('Fleet Management')).toBeInTheDocument();
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - Cars');
  });

  it('should display correct breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('breadcrumb-1')).toHaveTextContent('Cars');
  });

  it('should display page description', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('Monitor and manage all vehicles in real-time')).toBeInTheDocument();
  });

  it('should display Total Vehicles stat', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Vehicles')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument();
    });
  });

  it('should display valid ITV badges', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    await waitFor(() => {
      const validBadges = screen.getAllByText('ITV Valid');
      expect(validBadges.length).toBeGreaterThan(0);
    });
  });

  it('should display Unique Users stat', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Unique Users')).toBeInTheDocument();
    });
  });

  it('should display Badge Types stat', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Badge Types')).toBeInTheDocument();
    });
  });

  it('should display vehicle VEH-001', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('VEH-001')).toBeInTheDocument();
      expect(screen.getByText('ABC-1234')).toBeInTheDocument();
    });
  });

  it('should display vehicle VEH-002', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('VEH-002')).toBeInTheDocument();
      expect(screen.getByText('XYZ-5678')).toBeInTheDocument();
    });
  });

  it('should display vehicle VEH-003', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('VEH-003')).toBeInTheDocument();
      expect(screen.getByText('DEF-9012')).toBeInTheDocument();
    });
  });

  it('should display vehicle VEH-004', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('VEH-004')).toBeInTheDocument();
      expect(screen.getByText('GHI-3456')).toBeInTheDocument();
    });
  });

  it('should display vehicle VEH-005', async () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('VEH-005')).toBeInTheDocument();
      expect(screen.getByText('JKL-7890')).toBeInTheDocument();
    });
  });
});
