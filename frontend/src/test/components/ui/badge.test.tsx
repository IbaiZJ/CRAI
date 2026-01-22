import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from '@/components/ui/badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders with data-slot attribute', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'badge');
    });

    it('renders as span by default', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      expect(screen.getByTestId('badge').tagName).toBe('SPAN');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-primary');
    });

    it('renders secondary variant', () => {
      render(<Badge data-testid="badge" variant="secondary">Secondary</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-secondary');
    });

    it('renders destructive variant', () => {
      render(<Badge data-testid="badge" variant="destructive">Destructive</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('renders outline variant', () => {
      render(<Badge data-testid="badge" variant="outline">Outline</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-foreground');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Badge data-testid="badge" className="custom-class">Badge</Badge>);
      expect(screen.getByTestId('badge')).toHaveClass('custom-class');
    });

    it('merges custom className with variant classes', () => {
      render(
        <Badge data-testid="badge" variant="secondary" className="custom-class">
          Badge
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('bg-secondary');
    });
  });

  describe('asChild prop', () => {
    it('renders as child element when asChild is true', () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('preserves badge styles when using asChild', () => {
      render(
        <Badge asChild variant="secondary">
          <button type="button">Button Badge</button>
        </Badge>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });
  });

  describe('badgeVariants function', () => {
    it('returns default variant classes', () => {
      const classes = badgeVariants({ variant: 'default' });
      expect(classes).toContain('bg-primary');
    });

    it('returns secondary variant classes', () => {
      const classes = badgeVariants({ variant: 'secondary' });
      expect(classes).toContain('bg-secondary');
    });

    it('returns destructive variant classes', () => {
      const classes = badgeVariants({ variant: 'destructive' });
      expect(classes).toContain('bg-destructive');
    });

    it('returns outline variant classes', () => {
      const classes = badgeVariants({ variant: 'outline' });
      expect(classes).toContain('text-foreground');
    });

    it('returns default variant when no variant specified', () => {
      const classes = badgeVariants({});
      expect(classes).toContain('bg-primary');
    });
  });

  describe('HTML Attributes', () => {
    it('passes through HTML attributes', () => {
      render(
        <Badge data-testid="badge" id="test-id" title="Test title">
          Badge
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('id', 'test-id');
      expect(badge).toHaveAttribute('title', 'Test title');
    });

    it('renders with icon children', () => {
      render(
        <Badge data-testid="badge">
          <svg data-testid="icon" />
          Badge with icon
        </Badge>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Badge with icon')).toBeInTheDocument();
    });
  });
});
