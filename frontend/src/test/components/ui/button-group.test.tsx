import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  ButtonGroup, 
  ButtonGroupText, 
  ButtonGroupSeparator 
} from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';

describe('ButtonGroup Components', () => {
  describe('ButtonGroup', () => {
    it('renders a fieldset element', () => {
      render(<ButtonGroup data-testid="group" />);
      const group = screen.getByTestId('group');
      expect(group.tagName).toBe('FIELDSET');
      expect(group).toHaveAttribute('data-slot', 'button-group');
    });

    it('defaults to horizontal orientation', () => {
      render(<ButtonGroup data-testid="group" orientation="horizontal" />);
      expect(screen.getByTestId('group')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('supports vertical orientation', () => {
      render(<ButtonGroup data-testid="group" orientation="vertical" />);
      expect(screen.getByTestId('group')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('applies custom className', () => {
      render(<ButtonGroup data-testid="group" className="custom-group" />);
      expect(screen.getByTestId('group')).toHaveClass('custom-group');
    });

    it('renders children correctly', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
          <Button>Second</Button>
        </ButtonGroup>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('ButtonGroupText', () => {
    it('renders a div by default', () => {
      render(<ButtonGroupText data-testid="text">Text</ButtonGroupText>);
      const text = screen.getByTestId('text');
      expect(text.tagName).toBe('DIV');
    });

    it('applies custom className', () => {
      render(<ButtonGroupText data-testid="text" className="custom-text">Text</ButtonGroupText>);
      expect(screen.getByTestId('text')).toHaveClass('custom-text');
    });

    it('renders as Slot when asChild is true', () => {
      render(
        <ButtonGroupText asChild>
          <span data-testid="custom-element">Custom</span>
        </ButtonGroupText>
      );
      expect(screen.getByTestId('custom-element').tagName).toBe('SPAN');
    });
  });

  describe('ButtonGroupSeparator', () => {
    it('renders with separator data-slot', () => {
      render(<ButtonGroupSeparator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toHaveAttribute('data-slot', 'button-group-separator');
    });

    it('defaults to vertical orientation', () => {
      render(<ButtonGroupSeparator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('supports horizontal orientation', () => {
      render(<ButtonGroupSeparator data-testid="separator" orientation="horizontal" />);
      expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('applies custom className', () => {
      render(<ButtonGroupSeparator data-testid="separator" className="my-separator" />);
      expect(screen.getByTestId('separator')).toHaveClass('my-separator');
    });
  });

  describe('ButtonGroup Integration', () => {
    it('renders a button group with buttons and separator', () => {
      render(
        <ButtonGroup>
          <Button>Copy</Button>
          <ButtonGroupSeparator />
          <Button>Cut</Button>
          <ButtonGroupSeparator />
          <Button>Paste</Button>
        </ButtonGroup>
      );
      
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Cut')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
    });

    it('renders vertical button group', () => {
      render(
        <ButtonGroup orientation="vertical" data-testid="vertical-group">
          <Button>Option 1</Button>
          <Button>Option 2</Button>
        </ButtonGroup>
      );
      
      expect(screen.getByTestId('vertical-group')).toHaveAttribute('data-orientation', 'vertical');
    });
  });
});
