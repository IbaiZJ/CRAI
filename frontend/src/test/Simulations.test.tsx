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

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string }) => (
    <button data-testid="button" data-variant={variant} data-size={size} onClick={onClick}>{children}</button>
  ),
}));

import Simulations from '@/pages/Simulations';

describe('Simulations Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
  });

  it('should render the simulations page', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Simulations', level: 1 })).toBeInTheDocument();
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - Simulations');
  });

  it('should display correct breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('breadcrumb-1')).toHaveTextContent('Simulations');
  });

  it('should display page description', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Create and manage AI-powered simulations')).toBeInTheDocument();
  });

  it('should display Total Simulations stat', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Simulations')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should display Running stat card', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Running').length).toBeGreaterThan(0);
  });

  it('should display Completed stat card', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });

  it('should display Avg Accuracy stat', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Avg Accuracy')).toBeInTheDocument();
    expect(screen.getByText('92.5%')).toBeInTheDocument();
  });

  it('should display simulation Traffic Flow Analysis', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Traffic Flow Analysis')).toBeInTheDocument();
  });

  it('should display simulation Crime Prediction Model', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Crime Prediction Model')).toBeInTheDocument();
  });

  it('should display simulation Emergency Response', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Emergency Response')).toBeInTheDocument();
  });

  it('should display simulation Crowd Behavior', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Crowd Behavior')).toBeInTheDocument();
  });

  it('should display simulation Resource Allocation', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Resource Allocation')).toBeInTheDocument();
  });

  it('should display simulation Incident Reconstruction', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('Incident Reconstruction')).toBeInTheDocument();
  });

  it('should display simulation durations', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('2h 15m')).toBeInTheDocument();
    expect(screen.getByText('1h 45m')).toBeInTheDocument();
    expect(screen.getByText('0h 35m')).toBeInTheDocument();
    expect(screen.getByText('0h 00m')).toBeInTheDocument();
    expect(screen.getByText('1h 20m')).toBeInTheDocument();
    expect(screen.getByText('3h 10m')).toBeInTheDocument();
  });

  it('should display simulation accuracies', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    expect(screen.getByText('94.5%')).toBeInTheDocument();
    expect(screen.getByText('89.2%')).toBeInTheDocument();
    expect(screen.getByText('91.8%')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText('96.3%')).toBeInTheDocument();
    expect(screen.getByText('92.7%')).toBeInTheDocument();
  });

  it('should display status badges', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should display action buttons', () => {
    render(
      <BrowserRouter>
        <Simulations />
      </BrowserRouter>
    );

    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
