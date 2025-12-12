import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

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

  it('should display Total Vehicles stat', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Vehicles')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should display Active stat card', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    // Stat card title and active car badges
    const activeElements = screen.getAllByText('Active');
    expect(activeElements.length).toBeGreaterThan(0);
  });

  it('should display Moving stat card', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Moving').length).toBeGreaterThan(0);
  });

  it('should display Maintenance stat card', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Maintenance').length).toBeGreaterThan(0);
  });

  it('should display vehicle VEH-001 (Tesla)', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('VEH-001')).toBeInTheDocument();
    expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    expect(screen.getByText('ABC-1234')).toBeInTheDocument();
  });

  it('should display vehicle VEH-002 (Toyota)', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('VEH-002')).toBeInTheDocument();
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('XYZ-5678')).toBeInTheDocument();
  });

  it('should display vehicle VEH-003 (Honda) in maintenance', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('VEH-003')).toBeInTheDocument();
    expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    expect(screen.getByText('DEF-9012')).toBeInTheDocument();
  });

  it('should display vehicle VEH-004 (Ford)', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('VEH-004')).toBeInTheDocument();
    expect(screen.getByText('Ford Explorer')).toBeInTheDocument();
    expect(screen.getByText('GHI-3456')).toBeInTheDocument();
  });

  it('should display vehicle VEH-005 (BMW)', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('VEH-005')).toBeInTheDocument();
    expect(screen.getByText('BMW X5')).toBeInTheDocument();
    expect(screen.getByText('JKL-7890')).toBeInTheDocument();
  });

  it('should display vehicle VEH-006 (Audi) inactive', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('VEH-006')).toBeInTheDocument();
    expect(screen.getByText('Audi A4')).toBeInTheDocument();
    expect(screen.getByText('MNO-2345')).toBeInTheDocument();
  });

  it('should display vehicle locations', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('Zone A - Parking 12')).toBeInTheDocument();
    expect(screen.getByText('Route 45 - Sector 3')).toBeInTheDocument();
    expect(screen.getByText('Workshop - Bay 2')).toBeInTheDocument();
  });

  it('should display vehicle speeds', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('65 km/h')).toBeInTheDocument();
    expect(screen.getByText('88 km/h')).toBeInTheDocument();
    expect(screen.getAllByText('0 km/h').length).toBeGreaterThan(0);
  });

  it('should display vehicle fuel levels', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('68%')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('should display status badges', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should display vehicle colors', () => {
    render(
      <BrowserRouter>
        <Cars />
      </BrowserRouter>
    );

    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getAllByText('Black').length).toBe(2);
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Silver')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
  });
});
