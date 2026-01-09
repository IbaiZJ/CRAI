import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

describe('AlertDialog Components', () => {
  describe('AlertDialog basic functionality', () => {
    it('should render alert dialog with trigger', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogDescription>Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      expect(screen.getByText('Open Dialog')).toBeInTheDocument()
    })

    it('should show dialog content when trigger is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Alert Title</AlertDialogTitle>
            <AlertDialogDescription>Alert Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert Description')).toBeInTheDocument()
    })

    it('should work with controlled open state', () => {
      render(
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogTitle>Visible</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      )

      expect(screen.getByText('Visible')).toBeInTheDocument()
    })

    it('should not show content when closed', () => {
      render(
        <AlertDialog open={false}>
          <AlertDialogContent>
            <AlertDialogTitle>Hidden</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      )

      expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    })
  })

  describe('AlertDialogTitle', () => {
    it('should render title with correct styling', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      
      const title = screen.getByText('Dialog Title')
      expect(title).toBeInTheDocument()
      expect(title.closest('[data-slot="alert-dialog-title"]')).toHaveClass('text-lg', 'font-semibold')
    })

    it('should accept custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle className="custom-title">Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      
      expect(screen.getByText('Title').closest('[data-slot="alert-dialog-title"]')).toHaveClass('custom-title')
    })
  })

  describe('AlertDialogDescription', () => {
    it('should render description with correct styling', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogDescription>Dialog Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      
      const description = screen.getByText('Dialog Description')
      expect(description).toBeInTheDocument()
      expect(description.closest('[data-slot="alert-dialog-description"]')).toHaveClass('text-sm')
    })

    it('should accept custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogDescription className="custom-desc">Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      
      expect(screen.getByText('Description').closest('[data-slot="alert-dialog-description"]')).toHaveClass('custom-desc')
    })
  })

  describe('AlertDialogAction', () => {
    it('should render action button', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    })

    it('should call onClick handler', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogAction onClick={handleClick}>Confirm</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      await user.click(screen.getByRole('button', { name: 'Confirm' }))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should accept custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogAction className="custom-action">Confirm</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveClass('custom-action')
    })
  })

  describe('AlertDialogCancel', () => {
    it('should render cancel button', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should call onClick handler', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogCancel onClick={handleClick}>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should accept custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogCancel className="custom-cancel">Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('custom-cancel')
    })
  })

  describe('AlertDialogHeader and Footer', () => {
    it('should render header with content', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Header Title</AlertDialogTitle>
              <AlertDialogDescription>Header Description</AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByText('Header Title')).toBeInTheDocument()
      expect(screen.getByText('Header Description')).toBeInTheDocument()
    })

    it('should render footer with buttons', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    })

    it('should apply custom className to header', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader className="custom-header">Content</AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByText('Content').closest('[data-slot="alert-dialog-header"]')).toHaveClass('custom-header')
    })

    it('should apply custom className to footer', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogFooter className="custom-footer">Content</AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByText('Content').closest('[data-slot="alert-dialog-footer"]')).toHaveClass('custom-footer')
    })
  })

  describe('complete alert dialog workflow', () => {
    it('should render complete alert dialog', async () => {
      const user = userEvent.setup()
      const handleConfirm = vi.fn()
      const handleCancel = vi.fn()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Delete Account</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Delete Account'))
      
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument()
      expect(screen.getByText(/permanently delete your account/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    it('should handle confirmation workflow', async () => {
      const user = userEvent.setup()
      const handleConfirm = vi.fn()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Confirm Action</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm</AlertDialogTitle>
              <AlertDialogDescription>Do you want to proceed?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Confirm Action'))
      await user.click(screen.getByRole('button', { name: 'Yes' }))
      
      expect(handleConfirm).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper data-slot attributes', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Title</AlertDialogTitle>
              <AlertDialogDescription>Description</AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      
      expect(screen.getByText('Title').closest('[data-slot="alert-dialog-title"]')).toBeInTheDocument()
      expect(screen.getByText('Description').closest('[data-slot="alert-dialog-description"]')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle minimal configuration', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <p>Minimal content</p>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByText('Minimal content')).toBeInTheDocument()
    })

    it('should handle long content', async () => {
      const user = userEvent.setup()
      const longText = 'A'.repeat(500)
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogDescription>{longText}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle multiple actions', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Action 1</AlertDialogAction>
              <AlertDialogAction>Action 2</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Open'))
      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument()
    })
  })

  describe('custom trigger', () => {
    it('should work with asChild prop', async () => {
      const user = userEvent.setup()
      
      render(
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="custom-button">Custom Trigger</button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Content</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByText('Custom Trigger'))
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})
