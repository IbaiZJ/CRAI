import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/components/AppSidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">App Sidebar</div>,
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-inset">{children}</div>,
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-provider">{children}</div>,
  SidebarTrigger: ({ className }: { className?: string }) => <button data-testid="sidebar-trigger" className={className}>Toggle</button>,
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation, className }: { orientation?: string; className?: string }) => (
    <hr data-testid="separator" data-orientation={orientation} className={className} />
  ),
}));

vi.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav data-testid="breadcrumb">{children}</nav>,
  BreadcrumbItem: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <li data-testid="breadcrumb-item" className={className}>{children}</li>
  ),
  BreadcrumbLink: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <span data-testid="breadcrumb-link">{children}</span>
  ),
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <ol data-testid="breadcrumb-list">{children}</ol>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => <span data-testid="breadcrumb-page">{children}</span>,
  BreadcrumbSeparator: ({ className }: { className?: string }) => <span data-testid="breadcrumb-separator" className={className}>/</span>,
}));

import Layout from '@/layouts/Layout';

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div data-testid="child-content">Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render the SidebarProvider', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
  });

  it('should render the AppSidebar', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
  });

  it('should render the SidebarInset', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument();
  });

  it('should render the SidebarTrigger', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();
  });

  it('should render breadcrumb component', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('should render default breadcrumbs when none provided', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    // Default breadcrumbs are Dashboard and Data Fetching
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Data Fetching')).toBeInTheDocument();
  });

  it('should render custom breadcrumbs when provided', () => {
    const customBreadcrumbs = [
      { label: 'Home', to: '/' },
      { label: 'Users', to: '/users' },
      { label: 'Edit User' },
    ];

    render(
      <BrowserRouter>
        <Layout breadcrumbs={customBreadcrumbs}>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Edit User')).toBeInTheDocument();
  });

  it('should render last breadcrumb as page (not link)', () => {
    const customBreadcrumbs = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Current Page' },
    ];

    render(
      <BrowserRouter>
        <Layout breadcrumbs={customBreadcrumbs}>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumb-page')).toHaveTextContent('Current Page');
  });

  it('should render separator between breadcrumbs', () => {
    const customBreadcrumbs = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Users', to: '/users' },
      { label: 'Edit' },
    ];

    render(
      <BrowserRouter>
        <Layout breadcrumbs={customBreadcrumbs}>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    const separators = screen.getAllByTestId('breadcrumb-separator');
    // Should have separators between items (n-1 separators for n items)
    expect(separators.length).toBe(2);
  });

  it('should render vertical separator', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should render empty breadcrumbs array as default breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Layout breadcrumbs={[]}>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    // Empty array should trigger default breadcrumbs
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Data Fetching')).toBeInTheDocument();
  });

  it('should render main content area', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div data-testid="main-content">Main Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });
});
