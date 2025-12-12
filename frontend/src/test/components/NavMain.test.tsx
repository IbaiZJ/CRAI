import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavMain } from '@/components/NavMain';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Home } from 'lucide-react';

describe('NavMain', () => {
  const mockItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
      isActive: true,
      items: [
        { title: 'Overview', url: '/dashboard/overview' }
      ]
    }
  ];

  it('should render navigation items', () => {
    render(
      <SidebarProvider>
        <NavMain items={mockItems} />
      </SidebarProvider>
    );

    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
