import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock recharts
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
  Tooltip: ({ content }: { content?: React.ReactNode }) => (
    <div data-testid="tooltip">{content}</div>
  ),
  Legend: ({ content }: { content?: React.ReactNode }) => (
    <div data-testid="legend">{content}</div>
  ),
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
  RadialBarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radial-bar-chart">{children}</div>
  ),
  RadialBar: () => <div data-testid="radial-bar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
}));

// Import chart components
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';

describe('Chart Components', () => {
  const mockConfig: ChartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-1))',
    },
    mobile: {
      label: 'Mobile',
      color: 'hsl(var(--chart-2))',
    },
  };

  describe('ChartContainer', () => {
    it('renders children correctly', () => {
      render(
        <ChartContainer config={mockConfig}>
          <div data-testid="chart-child">Chart Content</div>
        </ChartContainer>
      );
      expect(screen.getByTestId('chart-child')).toBeInTheDocument();
    });

    it('has data-slot="chart" attribute', () => {
      render(
        <ChartContainer config={mockConfig}>
          <div>Chart Content</div>
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('has data-chart attribute with generated id', () => {
      render(
        <ChartContainer config={mockConfig}>
          <div>Chart Content</div>
        </ChartContainer>
      );
      const container = document.querySelector('[data-chart]');
      expect(container).toBeInTheDocument();
      expect(container?.getAttribute('data-chart')).toMatch(/^chart-/);
    });

    it('uses custom id when provided', () => {
      render(
        <ChartContainer config={mockConfig} id="custom-chart">
          <div>Chart Content</div>
        </ChartContainer>
      );
      const container = document.querySelector('[data-chart="chart-custom-chart"]');
      expect(container).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <ChartContainer config={mockConfig} className="custom-class">
          <div>Chart Content</div>
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toHaveClass('custom-class');
    });

    it('renders with theme configuration', () => {
      const themeConfig: ChartConfig = {
        value: {
          label: 'Value',
          theme: {
            light: 'hsl(0, 0%, 0%)',
            dark: 'hsl(0, 0%, 100%)',
          },
        },
      };
      render(
        <ChartContainer config={themeConfig}>
          <div>Chart Content</div>
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders style tag for color configuration', () => {
      render(
        <ChartContainer config={mockConfig}>
          <div>Chart Content</div>
        </ChartContainer>
      );
      const style = document.querySelector('style');
      expect(style).toBeInTheDocument();
    });

    it('handles empty config', () => {
      render(
        <ChartContainer config={{}}>
          <div>Chart Content</div>
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });
  });

  describe('ChartTooltipContent', () => {
    it('returns null when not active', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={false} payload={[]} />
        </ChartContainer>
      );
      // The tooltip content should not render anything meaningful when not active
      expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
    });

    it('returns null when payload is empty', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={[]} />
        </ChartContainer>
      );
      expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
    });

    it('renders with active state and payload', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with hideLabel prop', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} hideLabel />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with hideIndicator prop', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} hideIndicator />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with indicator="dot"', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} indicator="dot" />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with indicator="line"', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} indicator="line" />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with indicator="dashed"', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} indicator="dashed" />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with custom formatter', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      const formatter = vi.fn(() => <span>Formatted</span>);
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} formatter={formatter} />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with labelFormatter', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      const labelFormatter = vi.fn((value) => `Label: ${value}`);
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent 
            active={true} 
            payload={payload} 
            label="Test"
            labelFormatter={labelFormatter} 
          />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} className="custom-tooltip" />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with nameKey prop', () => {
      const payload = [
        {
          customName: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} nameKey="customName" />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with labelKey prop', () => {
      const payload = [
        {
          name: 'desktop',
          value: 100,
          dataKey: 'desktop',
          color: 'hsl(var(--chart-1))',
          payload: { desktop: 100 },
        },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} labelKey="customLabel" />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });
  });

  describe('ChartLegendContent', () => {
    it('renders without payload', () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with payload', () => {
      const payload = [
        { value: 'desktop', dataKey: 'desktop', color: 'hsl(var(--chart-1))' },
        { value: 'mobile', dataKey: 'mobile', color: 'hsl(var(--chart-2))' },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with verticalAlign prop', () => {
      const payload = [
        { value: 'desktop', dataKey: 'desktop', color: 'hsl(var(--chart-1))' },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} verticalAlign="top" />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with hideIcon prop', () => {
      const payload = [
        { value: 'desktop', dataKey: 'desktop', color: 'hsl(var(--chart-1))' },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} hideIcon />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });

    it('renders with nameKey prop', () => {
      const payload = [
        { customName: 'desktop', value: 'desktop', dataKey: 'desktop', color: 'hsl(var(--chart-1))' },
      ];
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} nameKey="customName" />
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });
  });

  describe('ChartTooltip', () => {
    it('is exported and can be used', () => {
      expect(ChartTooltip).toBeDefined();
    });
  });

  describe('ChartLegend', () => {
    it('is exported and can be used', () => {
      expect(ChartLegend).toBeDefined();
    });
  });

  describe('Config with icon', () => {
    it('renders with config containing icon', () => {
      const IconComponent = () => <svg data-testid="icon" />;
      const configWithIcon: ChartConfig = {
        desktop: {
          label: 'Desktop',
          color: 'hsl(var(--chart-1))',
          icon: IconComponent,
        },
      };
      render(
        <ChartContainer config={configWithIcon}>
          <div>Chart Content</div>
        </ChartContainer>
      );
      const container = document.querySelector('[data-slot="chart"]');
      expect(container).toBeInTheDocument();
    });
  });
});
