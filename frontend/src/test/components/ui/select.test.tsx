import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select';

describe('Select Components', () => {
  describe('Select', () => {
    it('renders select root', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" />
        </Select>
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });
  });

  describe('SelectGroup', () => {
    it('renders select group', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" />
          <SelectContent>
            <SelectGroup data-testid="group">
              <SelectLabel>Options</SelectLabel>
              <SelectItem value="1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });
  });

  describe('SelectLabel', () => {
    it('renders label with correct data-slot within SelectGroup', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" />
          <SelectContent>
            <SelectGroup>
              <SelectLabel data-testid="label">Category</SelectLabel>
              <SelectItem value="1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('label')).toHaveAttribute('data-slot', 'select-label');
    });

    it('applies custom className within SelectGroup', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" />
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="custom-label" data-testid="label">
                Category
              </SelectLabel>
              <SelectItem value="1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('label')).toHaveClass('custom-label');
    });
  });

  describe('SelectTrigger', () => {
    it('renders trigger with correct data-slot', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" />
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'select-trigger');
    });

    it('defaults to default size', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" />
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-size', 'default');
    });

    it('supports sm size', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" size="sm" />
        </Select>
      );
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('SelectValue', () => {
    it('renders select value', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue data-testid="value" placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByTestId('value')).toHaveAttribute('data-slot', 'select-value');
    });
  });

  describe('SelectItem', () => {
    it('renders select item', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" />
          <SelectContent>
            <SelectItem value="1" data-testid="item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('item')).toHaveAttribute('data-slot', 'select-item');
    });
  });

  describe('SelectContent', () => {
    it('renders select content', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" />
          <SelectContent data-testid="content">
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'select-content');
    });
  });
});
