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

import Cameras from '@/pages/Cameras';

describe('Cameras Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
  });

  it('should render the cameras page', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cameras', level: 1 })).toBeInTheDocument();
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - Cameras');
  });

  it('should display correct breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('breadcrumb-1')).toHaveTextContent('Cameras');
  });

  it('should display page description', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('Monitor and manage all security cameras')).toBeInTheDocument();
  });

  it('should display Total Cameras stat', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Cameras')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should display Online cameras stat card', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    // Stat card title and online cameras badges
    const onlineElements = screen.getAllByText('Online');
    expect(onlineElements.length).toBeGreaterThan(0);
  });

  it('should display Offline stat card', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    // Stat card title and offline camera badge
    const offlineElements = screen.getAllByText('Offline');
    expect(offlineElements.length).toBeGreaterThan(0);
  });

  it('should display Maintenance stat card', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Maintenance').length).toBeGreaterThan(0);
  });

  it('should display camera CAM-001', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('CAM-001')).toBeInTheDocument();
    expect(screen.getByText('Main Entrance')).toBeInTheDocument();
    expect(screen.getByText('Building A - Floor 1')).toBeInTheDocument();
  });

  it('should display camera CAM-002', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('CAM-002')).toBeInTheDocument();
    expect(screen.getByText('Parking Lot')).toBeInTheDocument();
    expect(screen.getByText('Exterior - North')).toBeInTheDocument();
  });

  it('should display camera CAM-003 in maintenance', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('CAM-003')).toBeInTheDocument();
    expect(screen.getByText('Lobby Camera')).toBeInTheDocument();
  });

  it('should display camera CAM-004 offline', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('CAM-004')).toBeInTheDocument();
    expect(screen.getByText('Back Exit')).toBeInTheDocument();
  });

  it('should display camera CAM-005', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('CAM-005')).toBeInTheDocument();
    expect(screen.getByText('Conference Room')).toBeInTheDocument();
  });

  it('should display camera CAM-006', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('CAM-006')).toBeInTheDocument();
    expect(screen.getByText('Server Room')).toBeInTheDocument();
  });

  it('should display status badges', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should display camera quality specifications', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getAllByText('1080p').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4K').length).toBeGreaterThan(0);
    expect(screen.getByText('720p')).toBeInTheDocument();
  });

  it('should display camera FPS specifications', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getAllByText('30 FPS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('60 FPS').length).toBeGreaterThan(0);
    expect(screen.getByText('24 FPS')).toBeInTheDocument();
  });
});
