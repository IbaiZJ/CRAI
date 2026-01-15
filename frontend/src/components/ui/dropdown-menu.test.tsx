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
  describe('DropdownMenuItem', () => {
    it('should render a dropdown menu item', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByText('Open')
      expect(trigger).toBeInTheDocument()
    })

    it('should render menu item with default variant', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const menuItem = screen.getByText('Action')
      expect(menuItem).toBeInTheDocument()
      expect(menuItem.getAttribute('data-variant')).toBe('default')
    })

    it('should render menu item with destructive variant', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const deleteItem = screen.getByText('Delete')
      expect(deleteItem).toBeInTheDocument()
      expect(deleteItem.getAttribute('data-variant')).toBe('destructive')
    })

    it('should render menu item with inset', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const insetItem = screen.getByText('Inset Item')
      expect(insetItem.getAttribute('data-inset')).toBe('true')
    })

    it('should accept custom className', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-class">Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const item = screen.getByText('Item')
      expect(item.className).toContain('custom-class')
    })

    it('should render multiple menu items', () => {
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

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuCheckboxItem', () => {
    it('should render checkbox item', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>Option</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const checkboxItem = screen.getByText('Option')
      expect(checkboxItem).toBeInTheDocument()
      expect(checkboxItem.getAttribute('data-slot')).toBe(
        'dropdown-menu-checkbox-item'
      )
    })

    it('should render checkbox item with checked state', () => {
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

      const checkboxItem = screen.getByText('Checked Option')
      expect(checkboxItem).toHaveAttribute('data-state', 'checked')
    })

    it('should render checkbox item with unchecked state', () => {
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

      const checkboxItem = screen.getByText('Unchecked Option')
      expect(checkboxItem).toHaveAttribute('data-state', 'unchecked')
    })

    it('should accept custom className for checkbox item', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem className="custom-check">
              Custom
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const item = screen.getByText('Custom')
      expect(item.className).toContain('custom-check')
    })
  })

  describe('DropdownMenuRadioItem', () => {
    it('should render radio item', () => {
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

      const radioItem = screen.getByText('Option 1')
      expect(radioItem).toBeInTheDocument()
      expect(radioItem.getAttribute('data-slot')).toBe(
        'dropdown-menu-radio-item'
      )
    })

    it('should render multiple radio items in group', () => {
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

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuLabel', () => {
    it('should render label', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const label = screen.getByText('Actions')
      expect(label).toBeInTheDocument()
      expect(label.getAttribute('data-slot')).toBe('dropdown-menu-label')
    })

    it('should render label with inset', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const label = screen.getByText('Inset Label')
      expect(label.getAttribute('data-inset')).toBe('true')
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

      const separator = container.querySelector(
        '[data-slot="dropdown-menu-separator"]'
      )
      expect(separator).toBeInTheDocument()
    })
  })

  describe('DropdownMenuShortcut', () => {
    it('should render shortcut text', () => {
      render(
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

      const shortcut = screen.getByText('Ctrl+S')
      expect(shortcut).toBeInTheDocument()
      expect(shortcut.getAttribute('data-slot')).toBe(
        'dropdown-menu-shortcut'
      )
    })

    it('should accept custom className for shortcut', () => {
      render(
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

      const shortcut = screen.getByText('⌘K')
      expect(shortcut.className).toContain('custom-shortcut')
    })
  })

  describe('DropdownMenuSubTrigger', () => {
    it('should render sub trigger', () => {
      render(
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

      const subTrigger = screen.getByText('Submenu')
      expect(subTrigger).toBeInTheDocument()
      expect(subTrigger.getAttribute('data-slot')).toBe(
        'dropdown-menu-sub-trigger'
      )
    })

    it('should render sub trigger with inset', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger inset>Inset Submenu</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const subTrigger = screen.getByText('Inset Submenu')
      expect(subTrigger.getAttribute('data-inset')).toBe('true')
    })
  })

  describe('DropdownMenuGroup', () => {
    it('should render group', () => {
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

      const group = container.querySelector(
        '[data-slot="dropdown-menu-group"]'
      )
      expect(group).toBeInTheDocument()
      expect(screen.getByText('Group 1')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuContent', () => {
    it('should render content with custom className', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const content = container.querySelector(
        '[data-slot="dropdown-menu-content"]'
      )
      expect(content?.className).toContain('custom-content')
    })

    it('should apply default sideOffset', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const content = container.querySelector(
        '[data-slot="dropdown-menu-content"]'
      )
      expect(content).toBeInTheDocument()
    })

    it('should render content with custom sideOffset', () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={8}>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const content = container.querySelector(
        '[data-slot="dropdown-menu-content"]'
      )
      expect(content).toBeInTheDocument()
    })
  })

  describe('DropdownMenuTrigger', () => {
    it('should render trigger', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Click me</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByText('Click me')
      expect(trigger).toBeInTheDocument()
      expect(trigger.getAttribute('data-slot')).toBe('dropdown-menu-trigger')
    })
  })

  describe('Complex Structures', () => {
    it('should render complete dropdown menu structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Profile</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Edit
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                View
                <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('View')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should render dropdown with nested submenus', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>File</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>New</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>File</DropdownMenuItem>
                <DropdownMenuItem>Folder</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('File')).toBeInTheDocument()
      expect(screen.getByText('New')).toBeInTheDocument()
    })
  })
})
