import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select';

// Mock ResizeObserver for Radix UI
beforeAll(() => {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

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

  describe('SelectGroup', () => {
    it('renders select group when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup data-testid="group">
              <SelectLabel>Options</SelectLabel>
              <SelectItem value="1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByTestId('trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Options')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });
  });

  describe('SelectLabel', () => {
    it('renders label with correct text when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value="1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByTestId('trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Category')).toBeInTheDocument();
      });
    });

    it('renders multiple labels in different groups', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByTestId('trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Fruits')).toBeInTheDocument();
        expect(screen.getByText('Vegetables')).toBeInTheDocument();
      });
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

    it('displays selected value', () => {
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
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('SelectItem', () => {
    it('renders select items when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByTestId('trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });
    });

    it('calls onValueChange when item is selected', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Select onValueChange={onValueChange}>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByTestId('trigger'));
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Option 1'));
      
      expect(onValueChange).toHaveBeenCalledWith('option1');
    });
  });

  describe('SelectContent', () => {
    it('renders content when select is opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      
      // Content should not be visible initially (portal not rendered)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      
      // Open the select
      await user.click(screen.getByTestId('trigger'));
      
      // Content should be visible after opening
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
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

    it('updates aria-expanded when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
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
  });
});
