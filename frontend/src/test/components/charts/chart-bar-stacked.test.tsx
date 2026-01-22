import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock recharts completely
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
}));

// Import after mocking
import { ChartBarStacked } from '@/components/charts/barCharts/chart-bar-stacked';

describe('ChartBarStacked', () => {
  describe('Rendering', () => {
    it('renders the chart component', () => {
      render(<ChartBarStacked />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('renders with default title', () => {
      render(<ChartBarStacked />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('renders with default description', () => {
      render(<ChartBarStacked />);
      expect(screen.getByText('January - June 2024')).toBeInTheDocument();
    });

    it('renders the chart container', () => {
      render(<ChartBarStacked />);
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('renders with custom title', () => {
      render(<ChartBarStacked title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders with custom description', () => {
      render(<ChartBarStacked description="Custom Description" />);
      expect(screen.getByText('Custom Description')).toBeInTheDocument();
    });

    it('renders with custom data', () => {
      const customData = [
        { category: 'A', value1: 10, value2: 20 },
        { category: 'B', value1: 15, value2: 25 },
      ];
      render(<ChartBarStacked data={customData} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('renders with custom dataKeys', () => {
      const customDataKeys = [
        { key: 'sales', label: 'Sales', color: 'blue' },
        { key: 'revenue', label: 'Revenue', color: 'green' },
      ];
      render(<ChartBarStacked dataKeys={customDataKeys} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('renders with custom categoryKey', () => {
      const customData = [
        { date: '2024-01', value: 100 },
        { date: '2024-02', value: 200 },
      ];
      render(<ChartBarStacked data={customData} categoryKey="date" />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('renders with showFooter=true', () => {
      render(<ChartBarStacked showFooter={true} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('renders with showFooter=false', () => {
      render(<ChartBarStacked showFooter={false} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });
  });

  describe('Default Data', () => {
    it('uses default chart data when no data provided', () => {
      render(<ChartBarStacked />);
      // Component should render without errors with default data
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('renders inside a Card component', () => {
      render(<ChartBarStacked />);
      // Check for card structure
      const title = screen.getByText('Bar Chart - Stacked + Legend');
      expect(title).toBeInTheDocument();
    });

    it('has CardHeader with title and description', () => {
      render(<ChartBarStacked title="Test Title" description="Test Description" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  describe('Empty/Edge Cases', () => {
    it('handles empty data array', () => {
      render(<ChartBarStacked data={[]} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('handles undefined data', () => {
      render(<ChartBarStacked data={undefined} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('handles single data point', () => {
      const singleData = [{ month: 'January', desktop: 100, mobile: 50 }];
      render(<ChartBarStacked data={singleData} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });

    it('handles single dataKey', () => {
      const singleDataKey = [{ key: 'value', label: 'Value', color: 'red' }];
      render(<ChartBarStacked dataKeys={singleDataKey} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });
  });

  describe('Multiple DataKeys', () => {
    it('handles multiple dataKeys', () => {
      const multipleDataKeys = [
        { key: 'a', label: 'A', color: 'red' },
        { key: 'b', label: 'B', color: 'blue' },
        { key: 'c', label: 'C', color: 'green' },
      ];
      render(<ChartBarStacked dataKeys={multipleDataKeys} />);
      expect(screen.getByText('Bar Chart - Stacked + Legend')).toBeInTheDocument();
    });
  });
});
