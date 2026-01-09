import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton Component', () => {
  describe('basic rendering', () => {
    it('should render skeleton element', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toBeInTheDocument()
    })

    it('should apply default classes', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('bg-accent')
      expect(skeleton).toHaveClass('animate-pulse')
      expect(skeleton).toHaveClass('rounded-md')
    })

    it('should render as a div element', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton?.tagName).toBe('DIV')
    })
  })

  describe('custom styling', () => {
    it('should accept custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('custom-class')
      expect(skeleton).toHaveClass('bg-accent')
    })

    it('should merge custom classes with default classes', () => {
      const { container } = render(<Skeleton className="h-12 w-12" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('h-12')
      expect(skeleton).toHaveClass('w-12')
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should allow overriding default classes', () => {
      const { container } = render(<Skeleton className="rounded-full" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('rounded-full')
    })
  })

  describe('common use cases', () => {
    it('should render as loading placeholder for text', () => {
      const { container } = render(<Skeleton className="h-4 w-full" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('h-4')
      expect(skeleton).toHaveClass('w-full')
    })

    it('should render as loading placeholder for avatar', () => {
      const { container } = render(<Skeleton className="h-12 w-12 rounded-full" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('h-12')
      expect(skeleton).toHaveClass('w-12')
      expect(skeleton).toHaveClass('rounded-full')
    })

    it('should render as loading placeholder for card', () => {
      const { container } = render(<Skeleton className="h-64 w-full rounded-lg" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('h-64')
      expect(skeleton).toHaveClass('w-full')
      expect(skeleton).toHaveClass('rounded-lg')
    })
  })

  describe('multiple skeletons', () => {
    it('should render multiple skeleton elements', () => {
      const { container } = render(
        <div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )

      const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons.length).toBe(3)
    })

    it('should render skeleton for list items', () => {
      render(
        <div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </div>
      )

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons).toHaveLength(3)
    })
  })

  describe('layout patterns', () => {
    it('should render skeleton for user profile card', () => {
      render(
        <div className="card">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      )

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons).toHaveLength(3)
    })

    it('should render skeleton for article preview', () => {
      render(
        <div className="article">
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons).toHaveLength(5)
    })

    it('should render skeleton for table rows', () => {
      render(
        <table>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td><Skeleton className="h-8 w-full" /></td>
                <td><Skeleton className="h-8 w-full" /></td>
                <td><Skeleton className="h-8 w-full" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons).toHaveLength(9)
    })
  })

  describe('HTML attributes', () => {
    it('should accept data attributes', () => {
      const { container } = render(<Skeleton data-testid="loading-skeleton" />)
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('should accept aria attributes', () => {
      const { container } = render(<Skeleton aria-label="Loading content" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
    })

    it('should accept style prop', () => {
      const { container } = render(<Skeleton style={{ height: '100px' }} />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveStyle({ height: '100px' })
    })
  })

  describe('accessibility', () => {
    it('should have data-slot attribute for identification', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
    })

    it('should accept role attribute', () => {
      const { container } = render(<Skeleton role="status" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveAttribute('role', 'status')
    })

    it('should work with aria-busy', () => {
      const { container } = render(<Skeleton aria-busy="true" />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('edge cases', () => {
    it('should render without any props', () => {
      const { container } = render(<Skeleton />)
      expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    })

    it('should handle very long className strings', () => {
      const longClassName = 'class1 class2 class3 class4 class5 class6 class7 class8'
      const { container } = render(<Skeleton className={longClassName} />)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('class1', 'class2', 'class3')
    })

    it('should render with children (though typically not used)', () => {
      const { container } = render(<Skeleton>Content</Skeleton>)
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveTextContent('Content')
    })
  })

  describe('responsive design', () => {
    it('should apply responsive classes', () => {
      const { container } = render(
        <Skeleton className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4" />
      )
      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton).toHaveClass('w-full')
      expect(skeleton).toHaveClass('sm:w-1/2')
      expect(skeleton).toHaveClass('md:w-1/3')
      expect(skeleton).toHaveClass('lg:w-1/4')
    })
  })
})
