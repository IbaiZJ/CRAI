import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavProjects } from '@/components/NavProjects';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Folder } from 'lucide-react';

describe('NavProjects', () => {
  const mockProjects = [
    {
      name: 'Project A',
      url: '/projects/a',
      icon: Folder
    }
  ];

  it('should render project items', () => {
    render(
      <SidebarProvider>
        <NavProjects projects={mockProjects} />
      </SidebarProvider>
    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Project A')).toBeInTheDocument();
  });
});
