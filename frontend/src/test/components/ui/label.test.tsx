import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label Component', () => {
  it('renders a label element', () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('data-slot', 'label');
  });

  it('applies custom className', () => {
    render(<Label className="my-label-class">Custom Label</Label>);
    expect(screen.getByText('Custom Label')).toHaveClass('my-label-class');
  });

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Input Label</Label>);
    const label = screen.getByText('Input Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('renders children correctly', () => {
    render(
      <Label>
        <span>Icon</span>
        Label Text
      </Label>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('can be used with an input', () => {
    render(
      <div>
        <Label htmlFor="email-input">Email</Label>
        <input id="email-input" type="email" />
      </div>
    );
    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
  });
});
