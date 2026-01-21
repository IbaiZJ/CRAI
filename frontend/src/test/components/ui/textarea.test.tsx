import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea Component', () => {
  it('renders a textarea element', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('data-slot', 'textarea');
  });

  it('applies custom className', () => {
    render(<Textarea data-testid="textarea" className="custom-textarea" />);
    expect(screen.getByTestId('textarea')).toHaveClass('custom-textarea');
  });

  it('handles placeholder text', () => {
    render(<Textarea placeholder="Enter your message" />);
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<Textarea data-testid="textarea" disabled />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  it('handles value prop', () => {
    render(<Textarea data-testid="textarea" defaultValue="Default text" />);
    expect(screen.getByTestId('textarea')).toHaveValue('Default text');
  });

  it('handles rows prop', () => {
    render(<Textarea data-testid="textarea" rows={5} />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5');
  });

  it('handles name prop', () => {
    render(<Textarea data-testid="textarea" name="message" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('name', 'message');
  });

  it('handles required prop', () => {
    render(<Textarea data-testid="textarea" required />);
    expect(screen.getByTestId('textarea')).toBeRequired();
  });

  it('handles aria-invalid for error state', () => {
    render(<Textarea data-testid="textarea" aria-invalid="true" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'true');
  });
});
