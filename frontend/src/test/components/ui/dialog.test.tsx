import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

describe('Dialog Component', () => {
  it('should render Dialog with trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should have data-slot on trigger', () => {
    render(
      <Dialog>
        <DialogTrigger data-testid="dialog-trigger">Open</DialogTrigger>
      </Dialog>
    );

    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger');
  });
});

describe('DialogClose Component', () => {
  it('should render close button with children', () => {
    render(
      <Dialog>
        <DialogClose>Close</DialogClose>
      </Dialog>
    );

    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(
      <Dialog>
        <DialogClose data-testid="close">X</DialogClose>
      </Dialog>
    );

    const close = screen.getByTestId('close');
    expect(close).toHaveAttribute('data-slot', 'dialog-close');
  });
});

describe('DialogHeader Component', () => {
  it('should render header with children', () => {
    render(
      <DialogHeader>Header Content</DialogHeader>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(
      <DialogHeader data-testid="dialog-header">Header</DialogHeader>
    );

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveAttribute('data-slot', 'dialog-header');
  });

  it('should apply custom className', () => {
    render(
      <DialogHeader className="custom-header" data-testid="dialog-header">
        Header
      </DialogHeader>
    );

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('custom-header');
  });
});

describe('DialogFooter Component', () => {
  it('should render footer with children', () => {
    render(
      <DialogFooter>
        <button>Cancel</button>
        <button>Submit</button>
      </DialogFooter>
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(
      <DialogFooter data-testid="dialog-footer">Footer</DialogFooter>
    );

    const footer = screen.getByTestId('dialog-footer');
    expect(footer).toHaveAttribute('data-slot', 'dialog-footer');
  });

  it('should apply custom className', () => {
    render(
      <DialogFooter className="custom-footer" data-testid="dialog-footer">
        Footer
      </DialogFooter>
    );

    const footer = screen.getByTestId('dialog-footer');
    expect(footer).toHaveClass('custom-footer');
  });
});

describe('DialogTitle Component', () => {
  it('should render title with children', () => {
    render(
      <Dialog>
        <DialogTitle>My Dialog Title</DialogTitle>
      </Dialog>
    );

    expect(screen.getByText('My Dialog Title')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(
      <Dialog>
        <DialogTitle data-testid="dialog-title">Title</DialogTitle>
      </Dialog>
    );

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveAttribute('data-slot', 'dialog-title');
  });

  it('should apply custom className', () => {
    render(
      <Dialog>
        <DialogTitle className="custom-title" data-testid="dialog-title">
          Title
        </DialogTitle>
      </Dialog>
    );

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveClass('custom-title');
  });
});

describe('DialogDescription Component', () => {
  it('should render description with children', () => {
    render(
      <Dialog>
        <DialogDescription>This is a description</DialogDescription>
      </Dialog>
    );

    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(
      <Dialog>
        <DialogDescription data-testid="dialog-description">
          Description
        </DialogDescription>
      </Dialog>
    );

    const description = screen.getByTestId('dialog-description');
    expect(description).toHaveAttribute('data-slot', 'dialog-description');
  });

  it('should apply custom className', () => {
    render(
      <Dialog>
        <DialogDescription className="custom-desc" data-testid="dialog-description">
          Description
        </DialogDescription>
      </Dialog>
    );

    const description = screen.getByTestId('dialog-description');
    expect(description).toHaveClass('custom-desc');
  });
});

describe('Dialog Composition', () => {
  it('should render complete dialog header structure', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogHeader>
      </Dialog>
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
  });

  it('should render dialog with header and footer', () => {
    render(
      <Dialog>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <button>Cancel</button>
          <button>Confirm</button>
        </DialogFooter>
      </Dialog>
    );

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should render trigger with asChild prop', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button data-testid="custom-trigger">Custom Button</button>
        </DialogTrigger>
      </Dialog>
    );

    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    expect(screen.getByText('Custom Button')).toBeInTheDocument();
  });
});
