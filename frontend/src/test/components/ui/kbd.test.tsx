import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

describe('Kbd Components', () => {
  describe('Kbd', () => {
    it('should render kbd element', () => {
      const { container } = render(<Kbd>Ctrl</Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toBeInTheDocument()
      expect(kbd?.tagName).toBe('KBD')
    })

    it('should render text content', () => {
      render(<Kbd>Escape</Kbd>)
      expect(screen.getByText('Escape')).toBeInTheDocument()
    })

    it('should apply default styles', () => {
      const { container } = render(<Kbd>Enter</Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toHaveClass('bg-muted')
      expect(kbd).toHaveClass('text-muted-foreground')
      expect(kbd).toHaveClass('rounded-sm')
    })

    it('should accept custom className', () => {
      const { container } = render(<Kbd className="custom-kbd">K</Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toHaveClass('custom-kbd')
      expect(kbd).toHaveClass('bg-muted')
    })

    it('should render keyboard shortcuts', () => {
      render(
        <div>
          <Kbd>Ctrl</Kbd>
          <Kbd>Alt</Kbd>
          <Kbd>Delete</Kbd>
        </div>
      )

      expect(screen.getByText('Ctrl')).toBeInTheDocument()
      expect(screen.getByText('Alt')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should render single letter keys', () => {
      render(<Kbd>K</Kbd>)
      expect(screen.getByText('K')).toBeInTheDocument()
    })

    it('should render special keys', () => {
      render(
        <div>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
        </div>
      )

      expect(screen.getByText('↑')).toBeInTheDocument()
      expect(screen.getByText('↓')).toBeInTheDocument()
    })

    it('should render with icon', () => {
      render(
        <Kbd>
          <svg data-testid="icon" />
          K
        </Kbd>
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('K')).toBeInTheDocument()
    })
  })

  describe('KbdGroup', () => {
    it('should render kbd group', () => {
      const { container } = render(
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      )

      const group = container.querySelector('[data-slot="kbd-group"]')
      expect(group).toBeInTheDocument()
    })

    it('should render multiple keys in a group', () => {
      render(
        <KbdGroup>
          <Kbd>Cmd</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      )

      expect(screen.getByText('Cmd')).toBeInTheDocument()
      expect(screen.getByText('Shift')).toBeInTheDocument()
      expect(screen.getByText('P')).toBeInTheDocument()
    })

    it('should apply gap between keys', () => {
      const { container } = render(
        <KbdGroup>
          <Kbd>A</Kbd>
          <Kbd>B</Kbd>
        </KbdGroup>
      )

      const group = container.querySelector('[data-slot="kbd-group"]')
      expect(group).toHaveClass('gap-1')
    })

    it('should accept custom className', () => {
      const { container } = render(
        <KbdGroup className="custom-group">
          <Kbd>A</Kbd>
        </KbdGroup>
      )

      const group = container.querySelector('[data-slot="kbd-group"]')
      expect(group).toHaveClass('custom-group')
    })

    it('should render kbd group as kbd element', () => {
      const { container } = render(
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
        </KbdGroup>
      )

      const group = container.querySelector('[data-slot="kbd-group"]')
      expect(group?.tagName).toBe('KBD')
    })
  })

  describe('keyboard shortcut combinations', () => {
    it('should render common copy shortcut', () => {
      render(
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>C</Kbd>
        </KbdGroup>
      )

      expect(screen.getByText('Ctrl')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
    })

    it('should render paste shortcut', () => {
      render(
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>V</Kbd>
        </KbdGroup>
      )

      expect(screen.getByText('V')).toBeInTheDocument()
    })

    it('should render save shortcut', () => {
      render(
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
      )

      expect(screen.getByText('S')).toBeInTheDocument()
    })

    it('should render command palette shortcut', () => {
      render(
        <KbdGroup>
          <Kbd>Cmd</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      )

      expect(screen.getByText('Cmd')).toBeInTheDocument()
      expect(screen.getByText('K')).toBeInTheDocument()
    })

    it('should render triple key combination', () => {
      render(
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>F</Kbd>
        </KbdGroup>
      )

      expect(screen.getByText('Ctrl')).toBeInTheDocument()
      expect(screen.getByText('Shift')).toBeInTheDocument()
      expect(screen.getByText('F')).toBeInTheDocument()
    })
  })

  describe('styling variations', () => {
    it('should have pointer-events-none', () => {
      const { container } = render(<Kbd>K</Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toHaveClass('pointer-events-none')
    })

    it('should have select-none', () => {
      const { container } = render(<Kbd>K</Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toHaveClass('select-none')
    })

    it('should have inline-flex display', () => {
      const { container } = render(<Kbd>K</Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toHaveClass('inline-flex')
    })

    it('should have items-center alignment', () => {
      const { container } = render(<Kbd>K</Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toHaveClass('items-center')
    })
  })

  describe('real-world usage', () => {
    it('should render in documentation', () => {
      render(
        <div>
          <p>
            Press{' '}
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            {' '}to open command palette
          </p>
        </div>
      )

      expect(screen.getByText(/to open command palette/)).toBeInTheDocument()
      expect(screen.getByText('Ctrl')).toBeInTheDocument()
    })

    it('should render keyboard navigation help', () => {
      render(
        <div>
          <p>Use <Kbd>↑</Kbd> and <Kbd>↓</Kbd> to navigate</p>
          <p>Press <Kbd>Enter</Kbd> to select</p>
          <p>Press <Kbd>Esc</Kbd> to close</p>
        </div>
      )

      expect(screen.getByText('↑')).toBeInTheDocument()
      expect(screen.getByText('↓')).toBeInTheDocument()
      expect(screen.getByText('Enter')).toBeInTheDocument()
      expect(screen.getByText('Esc')).toBeInTheDocument()
    })

    it('should render keyboard shortcuts list', () => {
      render(
        <dl>
          <dt>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>C</Kbd>
            </KbdGroup>
          </dt>
          <dd>Copy</dd>
          <dt>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>V</Kbd>
            </KbdGroup>
          </dt>
          <dd>Paste</dd>
        </dl>
      )

      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Paste')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have data-slot attribute for kbd', () => {
      const { container } = render(<Kbd>K</Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toHaveAttribute('data-slot', 'kbd')
    })

    it('should have data-slot attribute for kbd group', () => {
      const { container } = render(
        <KbdGroup>
          <Kbd>K</Kbd>
        </KbdGroup>
      )
      const group = container.querySelector('[data-slot="kbd-group"]')
      expect(group).toHaveAttribute('data-slot', 'kbd-group')
    })
  })

  describe('edge cases', () => {
    it('should render empty kbd', () => {
      const { container } = render(<Kbd></Kbd>)
      const kbd = container.querySelector('[data-slot="kbd"]')
      expect(kbd).toBeInTheDocument()
    })

    it('should render with multiple children', () => {
      render(
        <Kbd>
          <span>Ctrl</span>
          <span>+</span>
          <span>K</span>
        </Kbd>
      )

      expect(screen.getByText('Ctrl')).toBeInTheDocument()
      expect(screen.getByText('+')).toBeInTheDocument()
      expect(screen.getByText('K')).toBeInTheDocument()
    })

    it('should handle long key names', () => {
      render(<Kbd>Command</Kbd>)
      expect(screen.getByText('Command')).toBeInTheDocument()
    })

    it('should accept HTML attributes', () => {
      const { container } = render(<Kbd data-testid="test-kbd" title="Keyboard key">K</Kbd>)
      const kbd = screen.getByTestId('test-kbd')
      expect(kbd).toHaveAttribute('title', 'Keyboard key')
    })
  })
})
