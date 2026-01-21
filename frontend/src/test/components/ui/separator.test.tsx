import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';

describe('Separator Component', () => {
  it('renders a horizontal separator by default', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-slot', 'separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders a vertical separator', () => {
    render(<Separator data-testid="separator" orientation="vertical" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('is decorative by default', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    // Decorative separators don't have a role
    expect(separator).not.toHaveAttribute('role');
  });

  it('can be non-decorative', () => {
    render(<Separator data-testid="separator" decorative={false} />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('applies custom className', () => {
    render(<Separator data-testid="separator" className="my-separator" />);
    expect(screen.getByTestId('separator')).toHaveClass('my-separator');
  });

  it('passes additional props', () => {
    render(<Separator data-testid="separator" aria-label="Divider" />);
    expect(screen.getByTestId('separator')).toHaveAttribute('aria-label', 'Divider');
  });
});
