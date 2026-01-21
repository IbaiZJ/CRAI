import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';

describe('Breadcrumb Components', () => {
  describe('Breadcrumb', () => {
    it('renders a nav element with breadcrumb aria-label', () => {
      render(<Breadcrumb data-testid="breadcrumb" />);
      const nav = screen.getByTestId('breadcrumb');
      expect(nav.tagName).toBe('NAV');
      expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
    });

    it('passes additional props to nav element', () => {
      render(<Breadcrumb data-testid="breadcrumb" className="custom-class" />);
      expect(screen.getByTestId('breadcrumb')).toHaveClass('custom-class');
    });
  });

  describe('BreadcrumbList', () => {
    it('renders an ordered list', () => {
      render(<BreadcrumbList data-testid="list" />);
      const list = screen.getByTestId('list');
      expect(list.tagName).toBe('OL');
      expect(list).toHaveAttribute('data-slot', 'breadcrumb-list');
    });

    it('applies custom className', () => {
      render(<BreadcrumbList data-testid="list" className="my-class" />);
      expect(screen.getByTestId('list')).toHaveClass('my-class');
    });
  });

  describe('BreadcrumbItem', () => {
    it('renders a list item', () => {
      render(
        <ul>
          <BreadcrumbItem data-testid="item">Item</BreadcrumbItem>
        </ul>
      );
      const item = screen.getByTestId('item');
      expect(item.tagName).toBe('LI');
      expect(item).toHaveAttribute('data-slot', 'breadcrumb-item');
    });

    it('applies custom className', () => {
      render(
        <ul>
          <BreadcrumbItem data-testid="item" className="custom">
            Item
          </BreadcrumbItem>
        </ul>
      );
      expect(screen.getByTestId('item')).toHaveClass('custom');
    });
  });

  describe('BreadcrumbLink', () => {
    it('renders a link by default', () => {
      render(<BreadcrumbLink href="/test">Link</BreadcrumbLink>);
      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
    });

    it('renders as Slot when asChild is true', () => {
      render(
        <BreadcrumbLink asChild>
          <button type="button">Custom Button</button>
        </BreadcrumbLink>
      );
      expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <BreadcrumbLink href="/test" className="link-class">
          Link
        </BreadcrumbLink>
      );
      expect(screen.getByRole('link')).toHaveClass('link-class');
    });
  });

  describe('BreadcrumbPage', () => {
    it('renders a span with aria-current="page"', () => {
      render(<BreadcrumbPage>Current Page</BreadcrumbPage>);
      const page = screen.getByText('Current Page');
      expect(page.tagName).toBe('SPAN');
      expect(page).toHaveAttribute('aria-current', 'page');
      expect(page).toHaveAttribute('data-slot', 'breadcrumb-page');
    });

    it('applies custom className', () => {
      render(<BreadcrumbPage className="page-class">Page</BreadcrumbPage>);
      expect(screen.getByText('Page')).toHaveClass('page-class');
    });
  });

  describe('BreadcrumbSeparator', () => {
    it('renders a list item with aria-hidden', () => {
      render(
        <ul>
          <BreadcrumbSeparator data-testid="separator" />
        </ul>
      );
      const separator = screen.getByTestId('separator');
      expect(separator.tagName).toBe('LI');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
      expect(separator).toHaveAttribute('data-slot', 'breadcrumb-separator');
    });

    it('renders custom children instead of default ChevronRight', () => {
      render(
        <ul>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
        </ul>
      );
      expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <ul>
          <BreadcrumbSeparator data-testid="separator" className="sep-class" />
        </ul>
      );
      expect(screen.getByTestId('separator')).toHaveClass('sep-class');
    });
  });

  describe('BreadcrumbEllipsis', () => {
    it('renders a span with aria-hidden', () => {
      render(<BreadcrumbEllipsis data-testid="ellipsis" />);
      const ellipsis = screen.getByTestId('ellipsis');
      expect(ellipsis.tagName).toBe('SPAN');
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
      expect(ellipsis).toHaveAttribute('data-slot', 'breadcrumb-ellipsis');
    });

    it('contains sr-only "More" text', () => {
      render(<BreadcrumbEllipsis />);
      expect(screen.getByText('More')).toHaveClass('sr-only');
    });

    it('applies custom className', () => {
      render(<BreadcrumbEllipsis data-testid="ellipsis" className="ellipsis-class" />);
      expect(screen.getByTestId('ellipsis')).toHaveClass('ellipsis-class');
    });
  });

  describe('Full Breadcrumb Integration', () => {
    it('renders a complete breadcrumb navigation', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
      expect(screen.getByText('Current Product')).toHaveAttribute('aria-current', 'page');
    });
  });
});
