import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('should render avatar container', () => {
      const { container } = render(<Avatar />)
      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toBeInTheDocument()
    })

    it('should apply default styles', () => {
      const { container } = render(<Avatar />)
      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toHaveClass('relative')
      expect(avatar).toHaveClass('flex')
      expect(avatar).toHaveClass('rounded-full')
      expect(avatar).toHaveClass('size-8')
    })

    it('should accept custom className', () => {
      const { container } = render(<Avatar className="custom-avatar" />)
      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toHaveClass('custom-avatar')
      expect(avatar).toHaveClass('rounded-full')
    })

    it('should render children', () => {
      render(
        <Avatar>
          <span>Content</span>
        </Avatar>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('AvatarImage', () => {
    it('should render avatar image', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="User avatar" />
        </Avatar>
      )
      const image = container.querySelector('[data-slot="avatar-image"]')
      expect(image).toBeInTheDocument()
    })

    it('should have correct src attribute', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" />
        </Avatar>
      )
      const image = container.querySelector('[data-slot="avatar-image"]')
      expect(image).toHaveAttribute('src', '/test.jpg')
    })

    it('should have correct alt attribute', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="John Doe" />
        </Avatar>
      )
      const image = container.querySelector('[data-slot="avatar-image"]')
      expect(image).toHaveAttribute('alt', 'John Doe')
    })

    it('should apply default styles', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Avatar" />
        </Avatar>
      )
      const image = container.querySelector('[data-slot="avatar-image"]')
      expect(image).toHaveClass('aspect-square')
      expect(image).toHaveClass('size-full')
    })

    it('should accept custom className', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Avatar" className="custom-image" />
        </Avatar>
      )
      const image = container.querySelector('[data-slot="avatar-image"]')
      expect(image).toHaveClass('custom-image')
    })
  })

  describe('AvatarFallback', () => {
    it('should render avatar fallback', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      const fallback = container.querySelector('[data-slot="avatar-fallback"]')
      expect(fallback).toBeInTheDocument()
    })

    it('should render fallback text', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      )
      expect(screen.getByText('AB')).toBeInTheDocument()
    })

    it('should apply default styles', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>XY</AvatarFallback>
        </Avatar>
      )
      const fallback = container.querySelector('[data-slot="avatar-fallback"]')
      expect(fallback).toHaveClass('bg-muted')
      expect(fallback).toHaveClass('flex')
      expect(fallback).toHaveClass('items-center')
      expect(fallback).toHaveClass('justify-center')
      expect(fallback).toHaveClass('rounded-full')
    })

    it('should accept custom className', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback className="custom-fallback">FB</AvatarFallback>
        </Avatar>
      )
      const fallback = container.querySelector('[data-slot="avatar-fallback"]')
      expect(fallback).toHaveClass('custom-fallback')
    })

    it('should render initials', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should render icon as fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>
            <svg data-testid="fallback-icon" />
          </AvatarFallback>
        </Avatar>
      )
      expect(screen.getByTestId('fallback-icon')).toBeInTheDocument()
    })
  })

  describe('complete avatar usage', () => {
    it('should render avatar with image and fallback', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )

      expect(container.querySelector('[data-slot="avatar-image"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument()
    })

    it('should render multiple avatars', () => {
      render(
        <div>
          <Avatar>
            <AvatarImage src="/user1.jpg" alt="User 1" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/user2.jpg" alt="User 2" />
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
        </div>
      )

      expect(screen.getByText('U1')).toBeInTheDocument()
      expect(screen.getByText('U2')).toBeInTheDocument()
    })
  })

  describe('real-world use cases', () => {
    it('should render user profile avatar', () => {
      render(
        <Avatar>
          <AvatarImage src="/profile.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should render avatar with custom size', () => {
      const { container } = render(
        <Avatar className="size-12">
          <AvatarImage src="/large.jpg" alt="Large avatar" />
          <AvatarFallback>L</AvatarFallback>
        </Avatar>
      )

      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toHaveClass('size-12')
    })

    it('should render avatar group for team members', () => {
      render(
        <div className="flex -space-x-2">
          <Avatar className="border-2 border-white">
            <AvatarImage src="/user1.jpg" alt="User 1" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-white">
            <AvatarImage src="/user2.jpg" alt="User 2" />
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-white">
            <AvatarFallback>+3</AvatarFallback>
          </Avatar>
        </div>
      )

      expect(screen.getByText('U1')).toBeInTheDocument()
      expect(screen.getByText('U2')).toBeInTheDocument()
      expect(screen.getByText('+3')).toBeInTheDocument()
    })

    it('should render avatar in navigation', () => {
      render(
        <nav>
          <Avatar>
            <AvatarImage src="/user.jpg" alt="Current user" />
            <AvatarFallback>Me</AvatarFallback>
          </Avatar>
        </nav>
      )

      expect(screen.getByText('Me')).toBeInTheDocument()
    })

    it('should render avatar with status indicator', () => {
      render(
        <div className="relative">
          <Avatar>
            <AvatarImage src="/user.jpg" alt="Online user" />
            <AvatarFallback>OU</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-white" />
        </div>
      )

      expect(screen.getByText('OU')).toBeInTheDocument()
    })
  })

  describe('fallback scenarios', () => {
    it('should show fallback when image fails to load', () => {
      render(
        <Avatar>
          <AvatarImage src="/broken.jpg" alt="Broken" />
          <AvatarFallback>BR</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('BR')).toBeInTheDocument()
    })

    it('should show fallback with single letter', () => {
      render(
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('should show fallback with two letters', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('AB')).toBeInTheDocument()
    })

    it('should show fallback with three letters', () => {
      render(
        <Avatar>
          <AvatarFallback>ABC</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('ABC')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have data-slot attributes', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )

      expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="avatar-image"]')).toBeInTheDocument()
      expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument()
    })

    it('should have alt text on image', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="John Doe profile picture" />
        </Avatar>
      )

      const image = container.querySelector('[data-slot="avatar-image"]')
      expect(image).toHaveAttribute('alt', 'John Doe profile picture')
    })

    it('should be keyboard accessible when interactive', () => {
      render(
        <button>
          <Avatar>
            <AvatarImage src="/user.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </button>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should render empty avatar', () => {
      const { container } = render(<Avatar />)
      expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
    })

    it('should render avatar with only fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>Only</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('Only')).toBeInTheDocument()
    })

    it('should handle different image formats', () => {
      const { container } = render(
        <>
          <Avatar>
            <AvatarImage src="/user.png" alt="PNG" />
          </Avatar>
          <Avatar>
            <AvatarImage src="/user.jpg" alt="JPG" />
          </Avatar>
          <Avatar>
            <AvatarImage src="/user.webp" alt="WebP" />
          </Avatar>
        </>
      )

      const images = container.querySelectorAll('[data-slot="avatar-image"]')
      expect(images).toHaveLength(3)
    })

    it('should accept HTML attributes', () => {
      const { container } = render(
        <Avatar data-testid="test-avatar" title="User avatar">
          <AvatarFallback>UA</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByTestId('test-avatar')
      expect(avatar).toHaveAttribute('title', 'User avatar')
    })
  })

  describe('styling variations', () => {
    it('should render small avatar', () => {
      const { container } = render(
        <Avatar className="size-6">
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
      )

      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toHaveClass('size-6')
    })

    it('should render large avatar', () => {
      const { container } = render(
        <Avatar className="size-16">
          <AvatarFallback>L</AvatarFallback>
        </Avatar>
      )

      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toHaveClass('size-16')
    })

    it('should render with border', () => {
      const { container } = render(
        <Avatar className="border-4 border-blue-500">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      )

      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toHaveClass('border-4')
    })

    it('should render with shadow', () => {
      const { container } = render(
        <Avatar className="shadow-lg">
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
      )

      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).toHaveClass('shadow-lg')
    })
  })
})
