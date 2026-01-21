import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartSkeleton, ChartBarSkeleton } from '@/components/charts/ChartSkeleton';

describe('ChartSkeleton Components', () => {
  describe('ChartSkeleton', () => {
    it('renders the skeleton card', () => {
      render(<ChartSkeleton />);
      expect(screen.getByRole('article')).toBeInTheDocument(); // Card renders as article
    });

    it('applies custom className', () => {
      render(<ChartSkeleton className="custom-class" />);
      expect(screen.getByRole('article')).toHaveClass('custom-class');
    });

    it('does not render select skeleton by default', () => {
      const { container } = render(<ChartSkeleton />);
      // Should have 3 skeletons: title, description, chart area
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBe(3);
    });

    it('renders select skeleton when hasSelect is true', () => {
      const { container } = render(<ChartSkeleton hasSelect />);
      // Should have 4 skeletons: title, description, select, chart area
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBe(4);
    });

    it('renders with proper structure', () => {
      const { container } = render(<ChartSkeleton />);
      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
    });
  });

  describe('ChartBarSkeleton', () => {
    it('renders the bar skeleton card', () => {
      render(<ChartBarSkeleton />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ChartBarSkeleton className="bar-class" />);
      expect(screen.getByRole('article')).toHaveClass('bar-class');
    });

    it('renders 6 bar skeletons', () => {
      const { container } = render(<ChartBarSkeleton />);
      // 2 header skeletons + 6 bar skeletons = 8 total
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBe(8);
    });

    it('renders with proper structure', () => {
      const { container } = render(<ChartBarSkeleton />);
      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
    });
  });
});
