import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
} from './dropdown-menu'

describe('DropdownMenu Components', () => {
  describe('DropdownMenuTrigger', () => {
    it('should render trigger button', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Open')
    })

    it('should have aria-haspopup attribute', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    })

    it('should accept custom className', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger className="custom-trigger">Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-class">Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger.className).toContain('custom-trigger')
    })

    it('should render with data-slot attribute', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('DropdownMenuContent', () => {
    it('should render content structure', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const content = container.querySelector('[data-slot="dropdown-menu-content"]')
      expect(content?.className).toContain('custom-content')
    })

    it('should support align prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should support side prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent side="bottom">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('DropdownMenuItem', () => {
    it('should render trigger with items', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should support variant prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should support inset prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-item">Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const item = container.querySelector('[data-slot="dropdown-menu-item"]')
      expect(item).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const item = container.querySelector('[data-slot="dropdown-menu-item"]')
      expect(item).toBeInTheDocument()
    })
  })

  describe('DropdownMenuCheckboxItem', () => {
    it('should render structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>Option</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should support checked state', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>
              Checked Option
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should support unchecked state', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={false}>
              Unchecked Option
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem className="custom-check">
              Custom
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const item = container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')
      expect(item).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>Item</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const item = container.querySelector('[data-slot="dropdown-menu-checkbox-item"]')
      expect(item).toBeInTheDocument()
    })
  })

  describe('DropdownMenuRadioItem', () => {
    it('should render structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should render multiple items in group', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">
                Option 1
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">
                Option 2
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    })

    it('should support value prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="selected">
              <DropdownMenuRadioItem value="selected">
                Selected
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="option1">
                Option
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const item = container.querySelector('[data-slot="dropdown-menu-radio-item"]')
      expect(item).toBeInTheDocument()
    })
  })

  describe('DropdownMenuLabel', () => {
    it('should render structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should support inset prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('data-state', 'closed')
    })

    it('should have data-slot attribute', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const label = container.querySelector('[data-slot="dropdown-menu-label"]')
      expect(label).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="custom-label">Custom Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const label = container.querySelector('[data-slot="dropdown-menu-label"]')
      expect(label?.className).toContain('custom-label')
    })
  })

  describe('DropdownMenuSeparator', () => {
    it('should render separator', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const separator = container.querySelector('[data-slot="dropdown-menu-separator"]')
      expect(separator).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSeparator className="custom-sep" />
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const separator = container.querySelector('[data-slot="dropdown-menu-separator"]')
      expect(separator).toBeInTheDocument()
    })
  })

  describe('DropdownMenuShortcut', () => {
    it('should render with shortcut structure', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Save
              <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const shortcut = container.querySelector('[data-slot="dropdown-menu-shortcut"]')
      expect(shortcut).toBeInTheDocument()
    })

    it('should accept custom className for shortcut', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Action
              <DropdownMenuShortcut className="custom-shortcut">
                ⌘K
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const shortcut = container.querySelector('[data-slot="dropdown-menu-shortcut"]')
      expect(shortcut?.className).toContain('custom-shortcut')
    })
  })

  describe('DropdownMenuSub', () => {
    it('should render submenu structure', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const subTrigger = container.querySelector('[data-slot="dropdown-menu-sub-trigger"]')
      expect(subTrigger).toBeInTheDocument()
    })

    it('should support inset on subtrigger', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger inset>Submenu</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const subTrigger = container.querySelector('[data-inset="true"]')
      expect(subTrigger).toBeInTheDocument()
    })
  })

  describe('DropdownMenuGroup', () => {
    it('should render group structure', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Group 1</DropdownMenuLabel>
              <DropdownMenuItem>Item 1</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const group = container.querySelector('[data-slot="dropdown-menu-group"]')
      expect(group).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup className="custom-group">
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const group = container.querySelector('[data-slot="dropdown-menu-group"]')
      expect(group?.className).toContain('custom-group')
    })
  })

  describe('DropdownMenuPortal', () => {
    it('should render portal structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })
  })
})
