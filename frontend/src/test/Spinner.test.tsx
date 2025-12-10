import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner, SpinnerCustom } from '@/components/Spinner';

describe('Spinner', () => {
  it('should render spinner with default classes', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should render spinner with custom className', () => {
    render(<Spinner className="size-12" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('size-12');
  });

  it('should render spinner with additional props', () => {
    render(<Spinner data-testid="custom-spinner" />);
    const spinner = screen.getByTestId('custom-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply animate-spin class', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should render with size-8 class', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('size-8');
  });
});

describe('SpinnerCustom', () => {
  it('should render spinner custom component', () => {
    render(<SpinnerCustom />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'gap-4');
  });

  it('should contain a spinner', () => {
    render(<SpinnerCustom />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });
});

describe('SpinnerCustom', () => {
  it('should render spinner custom component', () => {
    render(<SpinnerCustom />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'gap-4');
  });

  it('should contain a spinner', () => {
    render(<SpinnerCustom />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });
});
