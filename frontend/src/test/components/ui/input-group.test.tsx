import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group';

describe('InputGroup Components', () => {
  describe('InputGroup', () => {
    it('renders a div element', () => {
      render(<InputGroup data-testid="group">Content</InputGroup>);
      const group = screen.getByTestId('group');
      expect(group.tagName).toBe('DIV');
      expect(group).toHaveAttribute('data-slot', 'input-group');
    });

    it('applies custom className', () => {
      render(<InputGroup data-testid="group" className="custom-class">Content</InputGroup>);
      expect(screen.getByTestId('group')).toHaveClass('custom-class');
    });

    it('renders children correctly', () => {
      render(
        <InputGroup>
          <span>Child Content</span>
        </InputGroup>
      );
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('InputGroupAddon', () => {
    it('renders a div element', () => {
      render(<InputGroupAddon data-testid="addon">Addon</InputGroupAddon>);
      const addon = screen.getByTestId('addon');
      expect(addon.tagName).toBe('DIV');
      expect(addon).toHaveAttribute('data-slot', 'input-group-addon');
    });

    it('defaults to inline-start alignment', () => {
      render(<InputGroupAddon data-testid="addon">Addon</InputGroupAddon>);
      expect(screen.getByTestId('addon')).toHaveAttribute('data-align', 'inline-start');
    });

    it('supports inline-end alignment', () => {
      render(<InputGroupAddon data-testid="addon" align="inline-end">Addon</InputGroupAddon>);
      expect(screen.getByTestId('addon')).toHaveAttribute('data-align', 'inline-end');
    });

    it('supports block-start alignment', () => {
      render(<InputGroupAddon data-testid="addon" align="block-start">Addon</InputGroupAddon>);
      expect(screen.getByTestId('addon')).toHaveAttribute('data-align', 'block-start');
    });

    it('supports block-end alignment', () => {
      render(<InputGroupAddon data-testid="addon" align="block-end">Addon</InputGroupAddon>);
      expect(screen.getByTestId('addon')).toHaveAttribute('data-align', 'block-end');
    });

    it('applies custom className', () => {
      render(<InputGroupAddon data-testid="addon" className="addon-class">Addon</InputGroupAddon>);
      expect(screen.getByTestId('addon')).toHaveClass('addon-class');
    });

    it('focuses input on click when not clicking a button', () => {
      const mockFocus = vi.fn();
      render(
        <InputGroup>
          <InputGroupAddon data-testid="addon">$</InputGroupAddon>
          <input data-testid="input" onFocus={mockFocus} />
        </InputGroup>
      );
      fireEvent.click(screen.getByTestId('addon'));
      // The input should attempt to be focused
      expect(mockFocus).toHaveBeenCalled();
    });
  });

  describe('InputGroupButton', () => {
    it('renders a button element', () => {
      render(<InputGroupButton data-testid="btn">Click</InputGroupButton>);
      const button = screen.getByTestId('btn');
      expect(button.tagName).toBe('BUTTON');
    });

    it('defaults to button type', () => {
      render(<InputGroupButton data-testid="btn">Click</InputGroupButton>);
      expect(screen.getByTestId('btn')).toHaveAttribute('type', 'button');
    });

    it('defaults to xs size', () => {
      render(<InputGroupButton data-testid="btn">Click</InputGroupButton>);
      expect(screen.getByTestId('btn')).toHaveAttribute('data-size', 'xs');
    });

    it('supports sm size', () => {
      render(<InputGroupButton data-testid="btn" size="sm">Click</InputGroupButton>);
      expect(screen.getByTestId('btn')).toHaveAttribute('data-size', 'sm');
    });

    it('supports icon-xs size', () => {
      render(<InputGroupButton data-testid="btn" size="icon-xs">X</InputGroupButton>);
      expect(screen.getByTestId('btn')).toHaveAttribute('data-size', 'icon-xs');
    });

    it('supports icon-sm size', () => {
      render(<InputGroupButton data-testid="btn" size="icon-sm">X</InputGroupButton>);
      expect(screen.getByTestId('btn')).toHaveAttribute('data-size', 'icon-sm');
    });

    it('applies custom className', () => {
      render(<InputGroupButton data-testid="btn" className="btn-class">Click</InputGroupButton>);
      expect(screen.getByTestId('btn')).toHaveClass('btn-class');
    });
  });

  describe('InputGroupText', () => {
    it('renders a span element', () => {
      render(<InputGroupText data-testid="text">Text</InputGroupText>);
      const text = screen.getByTestId('text');
      expect(text.tagName).toBe('SPAN');
    });

    it('applies custom className', () => {
      render(<InputGroupText data-testid="text" className="text-class">Text</InputGroupText>);
      expect(screen.getByTestId('text')).toHaveClass('text-class');
    });
  });

  describe('InputGroupInput', () => {
    it('renders an input element', () => {
      render(<InputGroupInput data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('data-slot', 'input-group-control');
    });

    it('applies custom className', () => {
      render(<InputGroupInput data-testid="input" className="input-class" />);
      expect(screen.getByTestId('input')).toHaveClass('input-class');
    });

    it('supports input props', () => {
      render(<InputGroupInput data-testid="input" placeholder="Enter value" />);
      expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Enter value');
    });
  });

  describe('InputGroupTextarea', () => {
    it('renders a textarea element', () => {
      render(<InputGroupTextarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('data-slot', 'input-group-control');
    });

    it('applies custom className', () => {
      render(<InputGroupTextarea data-testid="textarea" className="textarea-class" />);
      expect(screen.getByTestId('textarea')).toHaveClass('textarea-class');
    });

    it('supports textarea props', () => {
      render(<InputGroupTextarea data-testid="textarea" rows={5} />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5');
    });
  });

  describe('InputGroup Integration', () => {
    it('renders a complete input group with prefix', () => {
      render(
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="0.00" />
        </InputGroup>
      );

      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });

    it('renders an input group with button', () => {
      render(
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Search</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });
  });
});
