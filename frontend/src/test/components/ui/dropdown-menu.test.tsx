import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

// Mock Radix UI Portal to avoid JSDOM issues
vi.mock('@radix-ui/react-dropdown-menu', async () => {
  const actual = await vi.importActual('@radix-ui/react-dropdown-menu');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="portal">{children}</div>,
  };
});

describe('DropdownMenu Component', () => {
  it('should render DropdownMenu with trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
      </DropdownMenu>
    );

    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('should have data-slot on trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Open</DropdownMenuTrigger>
      </DropdownMenu>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
  });
});

describe('DropdownMenuGroup Component', () => {
  it('should render DropdownMenuGroup with children', () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup data-testid="group">
          <div>Item 1</div>
          <div>Item 2</div>
        </DropdownMenuGroup>
      </DropdownMenu>
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('data-slot', 'dropdown-menu-group');
  });
});

describe('DropdownMenuLabel Component', () => {
  it('should render DropdownMenuLabel with text', () => {
    render(
      <DropdownMenu>
        <DropdownMenuLabel>My Label</DropdownMenuLabel>
      </DropdownMenu>
    );

    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(
      <DropdownMenu>
        <DropdownMenuLabel data-testid="label">Label</DropdownMenuLabel>
      </DropdownMenu>
    );

    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('data-slot', 'dropdown-menu-label');
  });

  it('should apply inset style when inset prop is true', () => {
    render(
      <DropdownMenu>
        <DropdownMenuLabel inset data-testid="label-inset">Inset Label</DropdownMenuLabel>
      </DropdownMenu>
    );

    const label = screen.getByTestId('label-inset');
    expect(label).toHaveAttribute('data-inset', 'true');
  });
});

describe('DropdownMenuSeparator Component', () => {
  it('should render separator', () => {
    render(
      <DropdownMenu>
        <DropdownMenuSeparator data-testid="separator" />
      </DropdownMenu>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-slot', 'dropdown-menu-separator');
  });

  it('should apply custom className', () => {
    render(
      <DropdownMenu>
        <DropdownMenuSeparator className="custom-separator" data-testid="separator" />
      </DropdownMenu>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-separator');
  });
});

describe('DropdownMenuShortcut Component', () => {
  it('should render shortcut text', () => {
    render(
      <DropdownMenu>
        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
      </DropdownMenu>
    );

    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(
      <DropdownMenu>
        <DropdownMenuShortcut data-testid="shortcut">⌘S</DropdownMenuShortcut>
      </DropdownMenu>
    );

    const shortcut = screen.getByTestId('shortcut');
    expect(shortcut).toHaveAttribute('data-slot', 'dropdown-menu-shortcut');
  });

  it('should apply custom className', () => {
    render(
      <DropdownMenu>
        <DropdownMenuShortcut className="custom-shortcut" data-testid="shortcut">⌘D</DropdownMenuShortcut>
      </DropdownMenu>
    );

    const shortcut = screen.getByTestId('shortcut');
    expect(shortcut).toHaveClass('custom-shortcut');
  });
});

describe('DropdownMenu Composition', () => {
  it('should render complete dropdown structure without opening', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">
          <button>Options</button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );

    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument();
  });

  it('should render trigger with custom content', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button data-testid="custom-trigger">
            <span>Custom Trigger</span>
          </button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );

    const trigger = screen.getByTestId('custom-trigger');
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
  });
});
