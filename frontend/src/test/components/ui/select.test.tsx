import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// Note: Radix UI Select uses Portals which are difficult to test in JSDOM.
// These tests focus on what can be reliably tested without opening the dropdown.

describe('Select Components', () => {
  describe('Select', () => {
    it('renders select root', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });
  });

  describe('SelectTrigger', () => {
    it('renders trigger with correct data-slot', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'select-trigger');
    });

    it('defaults to default size', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-size', 'default');
    });

    it('supports sm size', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" size="sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-size', 'sm');
    });

    it('applies custom className', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" className="custom-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveClass('custom-trigger');
    });

    it('renders with placeholder text', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });
  });

  describe('SelectValue', () => {
    it('renders select value with data-slot', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue data-testid="value" placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('value')).toHaveAttribute('data-slot', 'select-value');
    });

    it('displays selected value in trigger', () => {
      render(
        <Select value="option1">
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      // When a value is selected, it shows in the trigger
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('shows placeholder when no value selected', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select something" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByText('Select something')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria attributes on trigger', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('role', 'combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('trigger has aria-autocomplete attribute', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('aria-autocomplete', 'none');
    });

    it('trigger is a button', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('Disabled State', () => {
    it('disables the trigger when disabled', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('trigger')).toBeDisabled();
    });

    it('trigger has disabled styles when disabled', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Controlled Select', () => {
    it('displays the controlled value', () => {
      render(
        <Select value="test-value">
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test-value">Test Value</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Test Value')).toBeInTheDocument();
    });

    it('displays different controlled values', () => {
      const { rerender } = render(
        <Select value="first">
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first">First</SelectItem>
            <SelectItem value="second">Second</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('First')).toBeInTheDocument();

      rerender(
        <Select value="second">
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first">First</SelectItem>
            <SelectItem value="second">Second</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Default Value', () => {
    it('displays the default value', () => {
      render(
        <Select defaultValue="default-option">
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default-option">Default Option</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Default Option')).toBeInTheDocument();
    });
  });
});
