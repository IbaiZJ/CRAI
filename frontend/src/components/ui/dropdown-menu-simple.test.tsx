import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './dropdown-menu'

describe('DropdownMenu', () => {
  it('should render trigger button', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render with menu items', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render with align prop', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render with side prop', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent side="bottom">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should accept custom className on trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger className="custom">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole('button')).toHaveClass('custom')
  })

  it('should have aria-haspopup attribute', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'menu')
  })
})
