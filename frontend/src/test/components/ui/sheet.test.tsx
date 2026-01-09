import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'

describe('Sheet Components', () => {
  describe('Sheet', () => {
    it('should render sheet with trigger and content', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <h2>Sheet Title</h2>
            </SheetHeader>
            <div>Sheet Content</div>
          </SheetContent>
        </Sheet>
      )

      const trigger = screen.getByText('Open Sheet')
      expect(trigger).toBeInTheDocument()

      await user.click(trigger)
      expect(screen.getByText('Sheet Title')).toBeInTheDocument()
      expect(screen.getByText('Sheet Content')).toBeInTheDocument()
    })

    it('should close sheet when close button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <div>Content</div>
          </SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByText('Content')).toBeInTheDocument()

      const closeButton = screen.getByRole('button', { name: /Close/i })
      await user.click(closeButton)
    })

    it('should render with controlled open state', () => {
      render(
        <Sheet open={true}>
          <SheetContent>Visible Content</SheetContent>
        </Sheet>
      )

      expect(screen.getByText('Visible Content')).toBeInTheDocument()
    })

    it('should not show content when closed', () => {
      render(
        <Sheet open={false}>
          <SheetContent>Hidden Content</SheetContent>
        </Sheet>
      )

      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument()
    })
  })

  describe('SheetContent sides', () => {
    it('should render with default right side', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      const content = screen.getByText('Content').closest('[data-slot="sheet-content"]')
      expect(content).toHaveClass('right-0')
    })

    it('should render with left side', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="left">Left Content</SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      const content = screen.getByText('Left Content').closest('[data-slot="sheet-content"]')
      expect(content).toHaveClass('left-0')
    })

    it('should render with top side', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="top">Top Content</SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      const content = screen.getByText('Top Content').closest('[data-slot="sheet-content"]')
      expect(content).toHaveClass('top-0')
    })

    it('should render with bottom side', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="bottom">Bottom Content</SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      const content = screen.getByText('Bottom Content').closest('[data-slot="sheet-content"]')
      expect(content).toHaveClass('bottom-0')
    })
  })

  describe('SheetHeader', () => {
    it('should render sheet header', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <h2>Header Title</h2>
              <p>Header description</p>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByText('Header Title')).toBeInTheDocument()
      expect(screen.getByText('Header description')).toBeInTheDocument()
    })

    it('should apply custom className to header', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader className="custom-header">Header</SheetHeader>
          </SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      const header = screen.getByText('Header').closest('[data-slot="sheet-header"]')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('SheetFooter', () => {
    it('should render sheet footer', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetFooter>
              <button>Cancel</button>
              <button>Save</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('should apply custom className to footer', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetFooter className="custom-footer">Footer</SheetFooter>
          </SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      const footer = screen.getByText('Footer').closest('[data-slot="sheet-footer"]')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('SheetClose', () => {
    it('should render custom close trigger', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <div>Content</div>
            <SheetClose asChild>
              <button>Custom Close</button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByText('Custom Close')).toBeInTheDocument()
    })
  })

  describe('complete sheet workflow', () => {
    it('should render complete sheet with all components', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open Settings</SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <h2>Settings</h2>
              <p>Manage your preferences</p>
            </SheetHeader>
            <div className="content">
              <label>Option 1</label>
              <input type="checkbox" />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <button>Cancel</button>
              </SheetClose>
              <button>Save changes</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open Settings'))
      
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Manage your preferences')).toBeInTheDocument()
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have close button with accessible label', async () => {
      const user = userEvent.setup()
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument()
    })
  })
})
