import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from '@/components/ui/sonner';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: ({ theme, className, icons, style, ...props }: any) => (
    <div 
      data-testid="sonner-toaster" 
      data-theme={theme} 
      className={className}
      style={style}
      {...props}
    >
      {icons && (
        <div data-testid="icons">
          <span data-testid="success-icon">{icons.success}</span>
          <span data-testid="info-icon">{icons.info}</span>
          <span data-testid="warning-icon">{icons.warning}</span>
          <span data-testid="error-icon">{icons.error}</span>
          <span data-testid="loading-icon">{icons.loading}</span>
        </div>
      )}
    </div>
  ),
}));

describe('Toaster', () => {
  it('renders the toaster component', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
  });

  it('applies the theme from useTheme', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toHaveAttribute('data-theme', 'light');
  });

  it('has the toaster group className', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toHaveClass('toaster', 'group');
  });

  it('renders all custom icons', () => {
    render(<Toaster />);
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
  });

  it('applies custom CSS variables via style', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveStyle({
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    });
  });

  it('passes through additional props', () => {
    render(<Toaster position="top-center" duration={5000} />);
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('position', 'top-center');
    expect(toaster).toHaveAttribute('duration', '5000');
  });
});
