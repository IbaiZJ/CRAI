import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavUnified, UnifiedNavItem } from '@/components/NavUnified';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BrowserRouter } from 'react-router-dom';
import { Home } from 'lucide-react';

describe('NavUnified', () => {
  const mockItems: UnifiedNavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
      navType: 'button'
    },
    {
      title: 'Settings',
      url: '#',
      navType: 'collapsible',
      items: [
        { title: 'Profile', url: '/settings/profile' }
      ]
    }
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  it('should render navigation items', () => {
    render(
      <BrowserRouter>
        <SidebarProvider>
          <NavUnified items={mockItems} />
        </SidebarProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should toggle collapsible items and save to localStorage', () => {
    render(
      <BrowserRouter>
        <SidebarProvider>
          <NavUnified items={mockItems} />
        </SidebarProvider>
      </BrowserRouter>
    );

    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    
    // Check localStorage
    const saved = JSON.parse(localStorage.getItem('sidebar-collapsible-state') || '{}');
    expect(saved['Settings']).toBe(true);
  });

  it('should load state from localStorage', () => {
    localStorage.setItem('sidebar-collapsible-state', JSON.stringify({ 'Settings': true }));

    render(
      <BrowserRouter>
        <SidebarProvider>
          <NavUnified items={mockItems} />
        </SidebarProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
