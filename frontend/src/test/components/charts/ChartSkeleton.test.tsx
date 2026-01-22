import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartSkeleton, ChartBarSkeleton } from '@/components/charts/ChartSkeleton';

describe('ChartSkeleton Components', () => {
  describe('ChartSkeleton', () => {
    it('renders the skeleton card', () => {
      render(<ChartSkeleton data-testid="chart-skeleton" />);
      expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ChartSkeleton className="custom-class" data-testid="chart-skeleton" />);
      expect(screen.getByTestId('chart-skeleton')).toHaveClass('custom-class');
    });

    it('renders skeleton elements', () => {
      render(<ChartSkeleton />);
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders card header', () => {
      render(<ChartSkeleton />);
      const header = document.querySelector('[data-slot="card-header"]');
      expect(header).toBeInTheDocument();
    });

    it('renders card content', () => {
      render(<ChartSkeleton />);
      const content = document.querySelector('[data-slot="card-content"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe('ChartBarSkeleton', () => {
    it('renders the bar skeleton card', () => {
      render(<ChartBarSkeleton data-testid="bar-skeleton" />);
      expect(screen.getByTestId('bar-skeleton')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ChartBarSkeleton className="bar-class" data-testid="bar-skeleton" />);
      expect(screen.getByTestId('bar-skeleton')).toHaveClass('bar-class');
    });

    it('renders multiple bar skeletons', () => {
      render(<ChartBarSkeleton />);
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      // Should have 2 header skeletons + 6 bar skeletons = 8
      expect(skeletons.length).toBeGreaterThanOrEqual(6);
    });

    it('renders card header', () => {
      render(<ChartBarSkeleton />);
      const header = document.querySelector('[data-slot="card-header"]');
      expect(header).toBeInTheDocument();
    });

    it('renders card content', () => {
      render(<ChartBarSkeleton />);
      const content = document.querySelector('[data-slot="card-content"]');
      expect(content).toBeInTheDocument();
    });
  });
});
