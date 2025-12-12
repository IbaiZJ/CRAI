import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamSwitcher } from '@/components/TeamSwitcher';
import { SidebarProvider } from '@/components/ui/sidebar';
import { User } from 'lucide-react';

describe('TeamSwitcher', () => {
  const mockTeams = [
    {
      name: 'Team A',
      logo: User,
      plan: 'Pro'
    }
  ];

  it('should render active team', () => {
    render(
      <SidebarProvider>
        <TeamSwitcher teams={mockTeams} />
      </SidebarProvider>
    );

    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('should render nothing if no teams provided', () => {
    render(
      <SidebarProvider>
        <TeamSwitcher teams={[]} />
      </SidebarProvider>
    );

    expect(screen.queryByText('Team A')).not.toBeInTheDocument();
    // Also check that no dropdown trigger is rendered
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
