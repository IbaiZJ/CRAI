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
    expect(screen.getByRole('heading', { name: 'Statistics', level: 1 })).toBeInTheDocument();
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - Statistics');
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

    expect(screen.getByText('Overview of your application metrics and performance')).toBeInTheDocument();
  });

  it('should display Total Users stat card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('2,543')).toBeInTheDocument();
    expect(screen.getByText('+12.5% from last month')).toBeInTheDocument();
  });

  it('should display Total Revenue stat card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$45,231')).toBeInTheDocument();
    expect(screen.getByText('+8.2% from last month')).toBeInTheDocument();
  });

  it('should display Active Sessions stat card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+23.1% from last month')).toBeInTheDocument();
  });

  it('should display Growth stat card', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('28%')).toBeInTheDocument();
    expect(screen.getByText('+5.4% from last month')).toBeInTheDocument();
  });

  it('should display Monthly Overview section', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('Monthly Overview')).toBeInTheDocument();
  });

  it('should display all months in Monthly Overview', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('January')).toBeInTheDocument();
    expect(screen.getByText('February')).toBeInTheDocument();
    expect(screen.getByText('March')).toBeInTheDocument();
    expect(screen.getByText('April')).toBeInTheDocument();
    expect(screen.getByText('May')).toBeInTheDocument();
    expect(screen.getByText('June')).toBeInTheDocument();
  });

  it('should display month percentages', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('should render 4 stat cards', () => {
    render(
      <BrowserRouter>
        <Statistics />
      </BrowserRouter>
    );

    const cards = screen.getAllByTestId('card');
    // 4 stat cards + 1 Monthly Overview card = 5 total
    expect(cards.length).toBe(5);
  });
});
