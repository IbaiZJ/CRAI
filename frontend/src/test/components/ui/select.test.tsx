import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

describe('Select Components', () => {
  describe('Select', () => {
    it('renders children', () => {
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
    it('renders a button element', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
    });

    it('defaults to default size', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-size', 'default');
    });

    it('supports sm size', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" size="sm">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-size', 'sm');
    });

    it('applies custom className', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" className="custom-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveClass('custom-trigger');
    });

    it('renders placeholder text', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });
  });

  describe('SelectValue', () => {
    it('renders placeholder when no value selected', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose..." />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByText('Choose...')).toBeInTheDocument();
    });
  });

  describe('SelectGroup', () => {
    it('groups related items', () => {
      render(
        <Select defaultValue="apple" open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup data-testid="fruit-group">
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('fruit-group')).toHaveAttribute('data-slot', 'select-group');
    });
  });

  describe('SelectLabel', () => {
    it('renders label with correct data-slot', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel data-testid="label">Label</SelectLabel>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('label')).toHaveAttribute('data-slot', 'select-label');
    });

    it('applies custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel data-testid="label" className="custom-label">Label</SelectLabel>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('label')).toHaveClass('custom-label');
    });
  });

  describe('SelectItem', () => {
    it('renders item with correct data-slot', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem data-testid="item" value="test">Test Item</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('item')).toHaveAttribute('data-slot', 'select-item');
    });

    it('applies custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem data-testid="item" value="test" className="custom-item">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('item')).toHaveClass('custom-item');
    });
  });

  describe('SelectSeparator', () => {
    it('renders separator with correct data-slot', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one">One</SelectItem>
            <SelectSeparator data-testid="separator" />
            <SelectItem value="two">Two</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('separator')).toHaveAttribute('data-slot', 'select-separator');
    });

    it('applies custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one">One</SelectItem>
            <SelectSeparator data-testid="separator" className="custom-sep" />
            <SelectItem value="two">Two</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('separator')).toHaveClass('custom-sep');
    });
  });

  describe('Select Integration', () => {
    it('renders a complete select with groups', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
    });
  });
});
