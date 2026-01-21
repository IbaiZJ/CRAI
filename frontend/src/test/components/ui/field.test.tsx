import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from '@/components/ui/field';

describe('Field Components', () => {
  describe('FieldSet', () => {
    it('renders a fieldset element', () => {
      render(<FieldSet data-testid="fieldset">Content</FieldSet>);
      const fieldset = screen.getByTestId('fieldset');
      expect(fieldset.tagName).toBe('FIELDSET');
      expect(fieldset).toHaveAttribute('data-slot', 'field-set');
    });

    it('applies custom className', () => {
      render(<FieldSet data-testid="fieldset" className="custom-class">Content</FieldSet>);
      expect(screen.getByTestId('fieldset')).toHaveClass('custom-class');
    });
  });

  describe('FieldLegend', () => {
    it('renders a legend element', () => {
      render(<FieldLegend data-testid="legend">Legend Text</FieldLegend>);
      const legend = screen.getByTestId('legend');
      expect(legend.tagName).toBe('LEGEND');
      expect(legend).toHaveAttribute('data-slot', 'field-legend');
    });

    it('defaults to legend variant', () => {
      render(<FieldLegend data-testid="legend">Text</FieldLegend>);
      expect(screen.getByTestId('legend')).toHaveAttribute('data-variant', 'legend');
    });

    it('supports label variant', () => {
      render(<FieldLegend data-testid="legend" variant="label">Text</FieldLegend>);
      expect(screen.getByTestId('legend')).toHaveAttribute('data-variant', 'label');
    });

    it('applies custom className', () => {
      render(<FieldLegend data-testid="legend" className="my-class">Text</FieldLegend>);
      expect(screen.getByTestId('legend')).toHaveClass('my-class');
    });
  });

  describe('FieldGroup', () => {
    it('renders a div element', () => {
      render(<FieldGroup data-testid="group">Content</FieldGroup>);
      const group = screen.getByTestId('group');
      expect(group.tagName).toBe('DIV');
      expect(group).toHaveAttribute('data-slot', 'field-group');
    });

    it('applies custom className', () => {
      render(<FieldGroup data-testid="group" className="group-class">Content</FieldGroup>);
      expect(screen.getByTestId('group')).toHaveClass('group-class');
    });
  });

  describe('Field', () => {
    it('renders a div element', () => {
      render(<Field data-testid="field">Content</Field>);
      const field = screen.getByTestId('field');
      expect(field.tagName).toBe('DIV');
      expect(field).toHaveAttribute('data-slot', 'field');
    });

    it('defaults to vertical orientation', () => {
      render(<Field data-testid="field">Content</Field>);
      expect(screen.getByTestId('field')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('supports horizontal orientation', () => {
      render(<Field data-testid="field" orientation="horizontal">Content</Field>);
      expect(screen.getByTestId('field')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('supports responsive orientation', () => {
      render(<Field data-testid="field" orientation="responsive">Content</Field>);
      expect(screen.getByTestId('field')).toHaveAttribute('data-orientation', 'responsive');
    });

    it('applies custom className', () => {
      render(<Field data-testid="field" className="field-class">Content</Field>);
      expect(screen.getByTestId('field')).toHaveClass('field-class');
    });
  });

  describe('FieldContent', () => {
    it('renders a div element', () => {
      render(<FieldContent data-testid="content">Content</FieldContent>);
      const content = screen.getByTestId('content');
      expect(content.tagName).toBe('DIV');
      expect(content).toHaveAttribute('data-slot', 'field-content');
    });

    it('applies custom className', () => {
      render(<FieldContent data-testid="content" className="content-class">Content</FieldContent>);
      expect(screen.getByTestId('content')).toHaveClass('content-class');
    });
  });

  describe('FieldLabel', () => {
    it('renders a label element', () => {
      render(<FieldLabel data-testid="label">Label Text</FieldLabel>);
      const label = screen.getByTestId('label');
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('data-slot', 'field-label');
    });

    it('applies custom className', () => {
      render(<FieldLabel data-testid="label" className="label-class">Text</FieldLabel>);
      expect(screen.getByTestId('label')).toHaveClass('label-class');
    });
  });

  describe('FieldTitle', () => {
    it('renders a div element', () => {
      render(<FieldTitle data-testid="title">Title</FieldTitle>);
      const title = screen.getByTestId('title');
      expect(title.tagName).toBe('DIV');
      expect(title).toHaveAttribute('data-slot', 'field-label');
    });

    it('applies custom className', () => {
      render(<FieldTitle data-testid="title" className="title-class">Title</FieldTitle>);
      expect(screen.getByTestId('title')).toHaveClass('title-class');
    });
  });

  describe('FieldDescription', () => {
    it('renders a p element', () => {
      render(<FieldDescription data-testid="desc">Description</FieldDescription>);
      const desc = screen.getByTestId('desc');
      expect(desc.tagName).toBe('P');
      expect(desc).toHaveAttribute('data-slot', 'field-description');
    });

    it('applies custom className', () => {
      render(<FieldDescription data-testid="desc" className="desc-class">Text</FieldDescription>);
      expect(screen.getByTestId('desc')).toHaveClass('desc-class');
    });
  });

  describe('FieldSeparator', () => {
    it('renders a div element', () => {
      render(<FieldSeparator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator.tagName).toBe('DIV');
      expect(separator).toHaveAttribute('data-slot', 'field-separator');
    });

    it('renders without content', () => {
      render(<FieldSeparator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toHaveAttribute('data-content', 'false');
    });

    it('renders with content text', () => {
      render(<FieldSeparator data-testid="separator">OR</FieldSeparator>);
      expect(screen.getByTestId('separator')).toHaveAttribute('data-content', 'true');
      expect(screen.getByText('OR')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<FieldSeparator data-testid="separator" className="sep-class" />);
      expect(screen.getByTestId('separator')).toHaveClass('sep-class');
    });
  });

  describe('FieldError', () => {
    it('renders nothing when no errors or children', () => {
      const { container } = render(<FieldError />);
      expect(container.firstChild).toBeNull();
    });

    it('renders children when provided', () => {
      render(<FieldError>Custom error message</FieldError>);
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders single error message', () => {
      render(<FieldError errors={[{ message: 'Error 1' }]} />);
      expect(screen.getByText('Error 1')).toBeInTheDocument();
    });

    it('renders multiple errors as list', () => {
      render(<FieldError errors={[{ message: 'Error 1' }, { message: 'Error 2' }]} />);
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
    });

    it('filters duplicate error messages', () => {
      render(<FieldError errors={[{ message: 'Same error' }, { message: 'Same error' }]} />);
      const errors = screen.getAllByText('Same error');
      expect(errors).toHaveLength(1);
    });

    it('handles undefined errors in array', () => {
      render(<FieldError errors={[{ message: 'Valid error' }, undefined]} />);
      expect(screen.getByText('Valid error')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<FieldError className="error-class">Error</FieldError>);
      expect(screen.getByRole('alert')).toHaveClass('error-class');
    });

    it('has alert role and field-error data-slot', () => {
      render(<FieldError>Error</FieldError>);
      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('data-slot', 'field-error');
    });
  });

  describe('Field Integration', () => {
    it('renders a complete field structure', () => {
      render(
        <FieldSet>
          <FieldLegend>Form Section</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="test">Test Label</FieldLabel>
              <FieldContent>
                <input id="test" />
                <FieldDescription>Helper text</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      );

      expect(screen.getByText('Form Section')).toBeInTheDocument();
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });
  });
});
