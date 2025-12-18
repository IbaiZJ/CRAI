import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

// Mock sub-components
vi.mock('@/components/NavUnified', () => ({
  NavUnified: () => <div data-testid="nav-unified">NavUnified</div>
}));

vi.mock('@/components/NavUser', () => ({
  NavUser: () => <div data-testid="nav-user">NavUser</div>
}));

vi.mock('@/components/TeamSwitcher', () => ({
  TeamSwitcher: () => <div data-testid="team-switcher">TeamSwitcher</div>
}));

describe('AppSidebar', () => {
  it('should render all sidebar sections', () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );

    expect(screen.getByTestId('team-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('nav-unified')).toBeInTheDocument();
    expect(screen.getByTestId('nav-user')).toBeInTheDocument();
  });
});
