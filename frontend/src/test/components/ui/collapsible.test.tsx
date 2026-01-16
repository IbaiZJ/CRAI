import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'

describe('Collapsible Components', () => {
  describe('basic functionality', () => {
    it('should render collapsible with trigger and content', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Hidden Content</CollapsibleContent>
        </Collapsible>
      )

      expect(screen.getByText('Toggle')).toBeInTheDocument()
    })

    it('should toggle content visibility when trigger is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content to toggle</CollapsibleContent>
        </Collapsible>
      )

      const trigger = screen.getByText('Toggle')
      await user.click(trigger)
      
      expect(screen.getByText('Content to toggle')).toBeInTheDocument()
    })

    it('should start collapsed by default', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Hidden Content</CollapsibleContent>
        </Collapsible>
      )

      // Content should not be visible initially
      const content = screen.queryByText('Hidden Content')
      expect(content).not.toBeInTheDocument()
    })

    it('should start open when defaultOpen is true', () => {
      render(
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Visible Content</CollapsibleContent>
        </Collapsible>
      )

      expect(screen.getByText('Visible Content')).toBeVisible()
    })
  })

  describe('controlled state', () => {
    it('should render in open state when controlled', () => {
      render(
        <Collapsible open={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Open Content</CollapsibleContent>
        </Collapsible>
      )

      expect(screen.getByText('Open Content')).toBeVisible()
    })

    it('should render in closed state when controlled', () => {
      render(
        <Collapsible open={false}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Closed Content</CollapsibleContent>
        </Collapsible>
      )

      const content = screen.queryByText('Closed Content')
      expect(content).not.toBeInTheDocument()
    })
  })

  describe('CollapsibleTrigger', () => {
    it('should render trigger with custom content', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>
            <span>Custom Trigger</span>
          </CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )

      expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
    })

    it('should work with asChild prop', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button>Button Trigger</button>
          </CollapsibleTrigger>
          <CollapsibleContent>Toggle Content</CollapsibleContent>
        </Collapsible>
      )

      const button = screen.getByRole('button', { name: 'Button Trigger' })
      await user.click(button)
      
      expect(screen.getByText('Toggle Content')).toBeVisible()
    })
  })

  describe('CollapsibleContent', () => {
    it('should render content with multiple children', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <p>Paragraph 3</p>
          </CollapsibleContent>
        </Collapsible>
      )

      await user.click(screen.getByText('Toggle'))
      
      expect(screen.getByText('Paragraph 1')).toBeVisible()
      expect(screen.getByText('Paragraph 2')).toBeVisible()
      expect(screen.getByText('Paragraph 3')).toBeVisible()
    })

    it('should apply data-slot attribute', () => {
      render(
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )

      const content = screen.getByText('Content').closest('[data-slot="collapsible-content"]')
      expect(content).toBeInTheDocument()
    })
  })

  describe('multiple collapsibles', () => {
    it('should handle multiple independent collapsibles', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <Collapsible>
            <CollapsibleTrigger>Toggle 1</CollapsibleTrigger>
            <CollapsibleContent>Content 1</CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger>Toggle 2</CollapsibleTrigger>
            <CollapsibleContent>Content 2</CollapsibleContent>
          </Collapsible>
        </>
      )

      await user.click(screen.getByText('Toggle 1'))
      expect(screen.getByText('Content 1')).toBeVisible()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

      await user.click(screen.getByText('Toggle 2'))
      expect(screen.getByText('Content 2')).toBeVisible()
    })
  })

  describe('real-world usage', () => {
    it('should work as FAQ accordion item', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button className="faq-question">
              What is React?
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="faq-answer">
              React is a JavaScript library for building user interfaces.
            </div>
          </CollapsibleContent>
        </Collapsible>
      )

      await user.click(screen.getByText('What is React?'))
      expect(screen.getByText(/JavaScript library/)).toBeVisible()
    })

    it('should work as expandable menu', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>
            <div>Menu Section</div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )

      await user.click(screen.getByText('Menu Section'))
      expect(screen.getByText('Item 1')).toBeVisible()
      expect(screen.getByText('Item 2')).toBeVisible()
      expect(screen.getByText('Item 3')).toBeVisible()
    })
  })

  describe('accessibility', () => {
    it('should have proper data-slot attributes', () => {
      render(
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )

      expect(screen.getByText('Trigger').closest('[data-slot="collapsible-trigger"]')).toBeInTheDocument()
      expect(screen.getByText('Content').closest('[data-slot="collapsible-content"]')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty content', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent></CollapsibleContent>
        </Collapsible>
      )

      await user.click(screen.getByText('Toggle'))
      // Should not throw error with empty content
    })

    it('should toggle multiple times', async () => {
      const user = userEvent.setup()
      
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>
      )

      const trigger = screen.getByText('Toggle')
      
      await user.click(trigger)
      expect(screen.getByText('Content')).toBeVisible()
      
      await user.click(trigger)
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
      
      await user.click(trigger)
      expect(screen.getByText('Content')).toBeVisible()
    })
  })
})
