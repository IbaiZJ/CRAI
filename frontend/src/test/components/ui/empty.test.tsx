import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty'

describe('Empty Components', () => {
  describe('Empty', () => {
    it('should render empty container', () => {
      const { container } = render(<Empty>Empty content</Empty>)
      const empty = container.querySelector('[data-slot="empty"]')
      expect(empty).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(<Empty>No items found</Empty>)
      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('should apply default styling', () => {
      const { container } = render(<Empty>Content</Empty>)
      const empty = container.querySelector('[data-slot="empty"]')
      expect(empty).toHaveClass('flex')
      expect(empty).toHaveClass('flex-col')
      expect(empty).toHaveClass('items-center')
      expect(empty).toHaveClass('justify-center')
    })

    it('should accept custom className', () => {
      const { container } = render(<Empty className="custom-empty">Content</Empty>)
      const empty = container.querySelector('[data-slot="empty"]')
      expect(empty).toHaveClass('custom-empty')
    })

    it('should render as div element', () => {
      const { container } = render(<Empty>Content</Empty>)
      const empty = container.querySelector('[data-slot="empty"]')
      expect(empty?.tagName).toBe('DIV')
    })
  })

  describe('EmptyHeader', () => {
    it('should render empty header', () => {
      const { container } = render(<EmptyHeader>Header content</EmptyHeader>)
      const header = container.querySelector('[data-slot="empty-header"]')
      expect(header).toBeInTheDocument()
    })

    it('should render children', () => {
      render(<EmptyHeader>No data available</EmptyHeader>)
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should apply default styles', () => {
      const { container } = render(<EmptyHeader>Header</EmptyHeader>)
      const header = container.querySelector('[data-slot="empty-header"]')
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('items-center')
      expect(header).toHaveClass('text-center')
    })

    it('should accept custom className', () => {
      const { container } = render(<EmptyHeader className="custom-header">Header</EmptyHeader>)
      const header = container.querySelector('[data-slot="empty-header"]')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('EmptyTitle', () => {
    it('should render empty title', () => {
      const { container } = render(<EmptyTitle>No Results</EmptyTitle>)
      const title = container.querySelector('[data-slot="empty-title"]')
      expect(title).toBeInTheDocument()
    })

    it('should render title text', () => {
      render(<EmptyTitle>Nothing to show</EmptyTitle>)
      expect(screen.getByText('Nothing to show')).toBeInTheDocument()
    })

    it('should apply typography styles', () => {
      const { container } = render(<EmptyTitle>Title</EmptyTitle>)
      const title = container.querySelector('[data-slot="empty-title"]')
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-medium')
      expect(title).toHaveClass('tracking-tight')
    })

    it('should accept custom className', () => {
      const { container } = render(<EmptyTitle className="custom-title">Title</EmptyTitle>)
      const title = container.querySelector('[data-slot="empty-title"]')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('EmptyDescription', () => {
    it('should render empty description', () => {
      const { container } = render(<EmptyDescription>Description text</EmptyDescription>)
      const description = container.querySelector('[data-slot="empty-description"]')
      expect(description).toBeInTheDocument()
    })

    it('should render description text', () => {
      render(<EmptyDescription>Try adjusting your filters</EmptyDescription>)
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
    })

    it('should apply text styles', () => {
      const { container } = render(<EmptyDescription>Description</EmptyDescription>)
      const description = container.querySelector('[data-slot="empty-description"]')
      expect(description).toHaveClass('text-muted-foreground')
      expect(description).toHaveClass('text-sm/relaxed')
    })

    it('should accept custom className', () => {
      const { container } = render(
        <EmptyDescription className="custom-desc">Description</EmptyDescription>
      )
      const description = container.querySelector('[data-slot="empty-description"]')
      expect(description).toHaveClass('custom-desc')
    })

    it('should render with links', () => {
      render(
        <EmptyDescription>
          No items found. <a href="/create">Create one</a>
        </EmptyDescription>
      )
      expect(screen.getByText('Create one')).toBeInTheDocument()
    })
  })

  describe('EmptyContent', () => {
    it('should render empty content', () => {
      const { container } = render(<EmptyContent>Content</EmptyContent>)
      const content = container.querySelector('[data-slot="empty-content"]')
      expect(content).toBeInTheDocument()
    })

    it('should render children', () => {
      render(
        <EmptyContent>
          <button>Add Item</button>
        </EmptyContent>
      )
      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
    })

    it('should apply layout styles', () => {
      const { container } = render(<EmptyContent>Content</EmptyContent>)
      const content = container.querySelector('[data-slot="empty-content"]')
      expect(content).toHaveClass('flex')
      expect(content).toHaveClass('flex-col')
      expect(content).toHaveClass('items-center')
    })

    it('should accept custom className', () => {
      const { container } = render(<EmptyContent className="custom-content">Content</EmptyContent>)
      const content = container.querySelector('[data-slot="empty-content"]')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('EmptyMedia', () => {
    it('should render empty media with default variant', () => {
      const { container } = render(<EmptyMedia>Icon</EmptyMedia>)
      const media = container.querySelector('[data-slot="empty-icon"]')
      expect(media).toBeInTheDocument()
      expect(media).toHaveAttribute('data-variant', 'default')
    })

    it('should render with icon variant', () => {
      const { container } = render(<EmptyMedia variant="icon">Icon</EmptyMedia>)
      const media = container.querySelector('[data-slot="empty-icon"]')
      expect(media).toHaveAttribute('data-variant', 'icon')
    })

    it('should apply default variant styles', () => {
      const { container } = render(<EmptyMedia variant="default">Icon</EmptyMedia>)
      const media = container.querySelector('[data-slot="empty-icon"]')
      expect(media).toHaveClass('bg-transparent')
    })

    it('should apply icon variant styles', () => {
      const { container } = render(<EmptyMedia variant="icon">Icon</EmptyMedia>)
      const media = container.querySelector('[data-slot="empty-icon"]')
      expect(media).toHaveClass('bg-muted')
    })

    it('should accept custom className', () => {
      const { container } = render(<EmptyMedia className="custom-media">Icon</EmptyMedia>)
      const media = container.querySelector('[data-slot="empty-icon"]')
      expect(media).toHaveClass('custom-media')
    })

    it('should render with svg icon', () => {
      render(
        <EmptyMedia variant="icon">
          <svg data-testid="empty-icon" />
        </EmptyMedia>
      )
      expect(screen.getByTestId('empty-icon')).toBeInTheDocument()
    })
  })

  describe('complete empty state', () => {
    it('should render complete empty state', () => {
      render(
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <svg data-testid="icon" />
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any items matching your search.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button>Clear filters</button>
          </EmptyContent>
        </Empty>
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('No results found')).toBeInTheDocument()
      expect(screen.getByText(/couldn't find any items/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
    })

    it('should render empty state without icon', () => {
      render(
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Empty inbox</EmptyTitle>
            <EmptyDescription>You have no new messages</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )

      expect(screen.getByText('Empty inbox')).toBeInTheDocument()
      expect(screen.getByText('You have no new messages')).toBeInTheDocument()
    })

    it('should render empty state with action buttons', () => {
      render(
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No projects</EmptyTitle>
            <EmptyDescription>Get started by creating your first project</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button>Create project</button>
            <button>Import project</button>
          </EmptyContent>
        </Empty>
      )

      expect(screen.getByRole('button', { name: 'Create project' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Import project' })).toBeInTheDocument()
    })
  })

  describe('real-world use cases', () => {
    it('should render empty search results', () => {
      render(
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No search results</EmptyTitle>
            <EmptyDescription>
              Try searching with different keywords
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )

      expect(screen.getByText('No search results')).toBeInTheDocument()
      expect(screen.getByText('Try searching with different keywords')).toBeInTheDocument()
    })

    it('should render empty table state', () => {
      render(
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No data available</EmptyTitle>
            <EmptyDescription>There are no records to display</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )

      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should render empty cart', () => {
      render(
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <svg data-testid="cart-icon" />
            </EmptyMedia>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyDescription>Add items to get started</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button>Browse products</button>
          </EmptyContent>
        </Empty>
      )

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Browse products' })).toBeInTheDocument()
    })

    it('should render empty notifications', () => {
      render(
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>You're all caught up!</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )

      expect(screen.getByText('No notifications')).toBeInTheDocument()
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have data-slot attributes', () => {
      const { container } = render(
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Title</EmptyTitle>
            <EmptyDescription>Description</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )

      expect(container.querySelector('[data-slot="empty"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="empty-header"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="empty-title"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="empty-description"]')).toBeInTheDocument()
    })

    it('should support aria attributes', () => {
      const { container } = render(
        <Empty role="status" aria-label="No content">
          <EmptyTitle>Empty</EmptyTitle>
        </Empty>
      )

      const empty = container.querySelector('[data-slot="empty"]')
      expect(empty).toHaveAttribute('role', 'status')
      expect(empty).toHaveAttribute('aria-label', 'No content')
    })
  })

  describe('edge cases', () => {
    it('should render without children', () => {
      const { container } = render(<Empty />)
      const empty = container.querySelector('[data-slot="empty"]')
      expect(empty).toBeInTheDocument()
    })

    it('should render with minimal content', () => {
      render(<Empty><EmptyTitle>Empty</EmptyTitle></Empty>)
      expect(screen.getByText('Empty')).toBeInTheDocument()
    })

    it('should handle long descriptions', () => {
      const longText = 'A'.repeat(200)
      render(<EmptyDescription>{longText}</EmptyDescription>)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should nest multiple components', () => {
      render(
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><span>📭</span></EmptyMedia>
            <EmptyTitle>Title</EmptyTitle>
            <EmptyDescription>Description</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button>Action 1</button>
            <button>Action 2</button>
          </EmptyContent>
        </Empty>
      )

      expect(screen.getByText('📭')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(2)
    })
  })
})
