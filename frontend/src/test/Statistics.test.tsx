import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>,
}));

import Statistics from '@/pages/Statistics';

describe('Statistics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
  });

  it('should render the statistics page', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'General Statistics', level: 1 })).toBeInTheDocument();
  });

  it.skip('should set document title', async () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(document.title).toBe('CRAI - Statistics');
    }, { timeout: 2000 });
  });

  it('should display correct breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('breadcrumb-1')).toHaveTextContent('Statistics');
  });

  it('should display page description', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Complete overview of system metrics')).toBeInTheDocument();
  });

  it('should display Total Users stat card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('should display Total Detections stat card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Detections')).toBeInTheDocument();
    expect(screen.getByText('All vehicle detections')).toBeInTheDocument();
  });

  it('should display Total Vehicles stat card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Registered vehicles')).toBeInTheDocument();
  });

  it('should display Total Cameras stat card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Cameras')).toBeInTheDocument();
  });

  it('should display ITV status cards', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Valid ITV')).toBeInTheDocument();
  });

  it('should display Detection Trends', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Detection Trends')).toBeInTheDocument();
  });

  it('should display ITV Status Trends', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('ITV Status Trends')).toBeInTheDocument();
  });

  it('should render multiple stat cards', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    const cards = screen.getAllByTestId('card');
    // 10 cards total on the Statistics page
    expect(cards.length).toBe(10);
  });

  it('should display Expired ITV card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Expired ITV')).toBeInTheDocument();
  });

  it('should display Expiring Soon ITV card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
  });

  it('should render within layout component', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('should display all card headers', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    const cardHeaders = screen.getAllByTestId('card-header');
    expect(cardHeaders.length).toBeGreaterThan(0);
  });

  it('should display all card content', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    const cardContents = screen.getAllByTestId('card-content');
    expect(cardContents.length).toBeGreaterThan(0);
  });

  it('should have General Statistics as main heading', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('General Statistics');
  });
});
