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

let mockUser: { fullName?: string; name?: string; surname?: string; email?: string } | null = {
  fullName: 'Test User',
  name: 'Test',
  surname: 'User',
  email: 'test@example.com',
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
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
    mockUser = {
      fullName: 'Test User',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
    };
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

    expect(screen.getByTestId('split-text')).toHaveTextContent('Hello, Test User!');
  });

  it('should render all chart components', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('chart-area-interactive')).toBeInTheDocument();
    expect(screen.getByTestId('chart-bar-stacked')).toBeInTheDocument();
    expect(screen.getByTestId('chart-bar-default')).toBeInTheDocument();
    expect(screen.getByTestId('chart-bar-mixed')).toBeInTheDocument();
  });

  it('should render payments table with data', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    expect(screen.getByTestId('payments-table')).toHaveTextContent('3 items');
  });

  it('should render count up component', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('count-up')).toBeInTheDocument();
  });

  it('should have correct breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('Dashboard');
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
  it('should fallback to name when fullName is not available', () => {
    mockUser = {
      name: 'OnlyName',
      email: 'test@example.com',
    };

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('split-text')).toHaveTextContent('Hello, OnlyName!');
  });

  it('should fallback to surname when fullName and name are missing', () => {
    mockUser = {
      surname: 'SurnameOnly',
      email: 'test@example.com',
    };

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('split-text')).toHaveTextContent('Hello, SurnameOnly!');
  });

  it('should fallback to Guest when no user data is available', () => {
    mockUser = null;

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('split-text')).toHaveTextContent('Hello, Guest!');
  });
});
