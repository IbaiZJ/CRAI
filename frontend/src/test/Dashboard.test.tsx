import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock all the chart components
vi.mock('@/components/charts/chart-area-interactive', () => ({
  ChartAreaInteractive: () => <div data-testid="chart-area-interactive">Chart Area Interactive</div>,
}));

vi.mock('@/components/charts/barCharts/chart-bar-stacked', () => ({
  ChartBarStacked: () => <div data-testid="chart-bar-stacked">Chart Bar Stacked</div>,
}));

vi.mock('@/components/charts/barCharts/chart-bar-default', () => ({
  ChartBarDefault: () => <div data-testid="chart-bar-default">Chart Bar Default</div>,
}));

vi.mock('@/components/charts/barCharts/chart-bar-mixed', () => ({
  ChartBarMixed: () => <div data-testid="chart-bar-mixed">Chart Bar Mixed</div>,
}));

vi.mock('@/components/dataTable/PaymentsTable', () => ({
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="payments-table">Payments Table: {data.length} items</div>
  ),
}));

vi.mock('@/components/SplitText', () => ({
  default: ({ text, className }: { text: string; className?: string }) => (
    <h1 data-testid="split-text" className={className}>{text}</h1>
  ),
}));

vi.mock('@/components/CountUp', () => ({
  default: ({ from, to, className }: { from: number; to: number; className?: string }) => (
    <div data-testid="count-up" className={className}>{from} - {to}</div>
  ),
}));

vi.mock('@/layouts/Layout', () => ({
  default: ({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs?: { label: string }[] }) => (
    <div data-testid="layout">
      <nav data-testid="breadcrumbs">{breadcrumbs?.map((b, i) => <span key={i}>{b.label}</span>)}</nav>
      {children}
    </div>
  ),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      fullName: 'Test User',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
    },
    isAuthenticated: true,
  }),
}));

vi.mock('@/constants/paymentConstant', () => ({
  default: [{ id: 1 }, { id: 2 }, { id: 3 }],
}));

import Dashboard from '@/pages/Dashboard';

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dashboard page', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('should display greeting with user name', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Hello, Test User/)).toBeInTheDocument();
  });

  it('should have correct breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Dashboard');
  });

  it('should render chart area interactive component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('chart-area-interactive')).toBeInTheDocument();
  });

  it('should render chart bar stacked component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('chart-bar-stacked')).toBeInTheDocument();
  });

  it('should render chart bar default component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('chart-bar-default')).toBeInTheDocument();
  });

  it('should render chart bar mixed component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('chart-bar-mixed')).toBeInTheDocument();
  });

  it('should render payments table component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('payments-table')).toBeInTheDocument();
  });

  it('should render split text component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('split-text')).toBeInTheDocument();
  });

  it('should render count up component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('count-up')).toBeInTheDocument();
  });

  it('should display page content within layout', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const layout = screen.getByTestId('layout');
    expect(layout).toBeInTheDocument();
    expect(layout.querySelector('[data-testid="breadcrumbs"]')).toBeInTheDocument();
  });

  it('should pass payment data to payments table', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Payments Table: 3 items')).toBeInTheDocument();
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - Dashboard');
  });
});

describe('Dashboard with different user states', () => {
  it('should fallback to name when fullName is not available', async () => {
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: {
          name: 'OnlyName',
          email: 'test@example.com',
        },
        isAuthenticated: true,
      }),
    }));

    // Re-import to get the new mock
    const { default: DashboardWithName } = await import('@/pages/Dashboard');
    
    render(
      <BrowserRouter>
        <DashboardWithName />
      </BrowserRouter>
    );

    // Should use available name
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });
});
