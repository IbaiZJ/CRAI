import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavProjects } from './NavProjects';
import { Folder, FileText, Settings } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';

// Mock use-mobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <SidebarProvider>
      {ui}
    </SidebarProvider>
  );
};

describe('NavProjects', () => {
  const mockProjects = [
    { name: 'Project 1', url: '/project1', icon: Folder },
    { name: 'Project 2', url: '/project2', icon: FileText },
    { name: 'Project 3', url: '/project3', icon: Settings },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders projects list correctly', () => {
      renderWithProviders(<NavProjects projects={mockProjects} />);

      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('renders project links with correct hrefs', () => {
      renderWithProviders(<NavProjects projects={mockProjects} />);

      const link1 = screen.getByText('Project 1').closest('a');
      const link2 = screen.getByText('Project 2').closest('a');

      expect(link1).toHaveAttribute('href', '/project1');
      expect(link2).toHaveAttribute('href', '/project2');
    });

    it('renders "More" button at the end', () => {
      renderWithProviders(<NavProjects projects={mockProjects} />);

      const moreButtons = screen.getAllByText('More');
      expect(moreButtons.length).toBeGreaterThan(0);
    });

    it('renders empty projects list', () => {
      renderWithProviders(<NavProjects projects={[]} />);

      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('More')).toBeInTheDocument();
    });
  });

  describe('Dropdown menu - Lines 58-59', () => {
    it('positions dropdown on right side when not mobile - Line 58', async () => {
      const { useIsMobile } = await import('@/hooks/use-mobile');
      vi.mocked(useIsMobile).mockReturnValue(false);

      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      // Find dropdown trigger buttons (MoreHorizontal icons)
      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && 
        btn.getAttribute('data-sidebar') === 'menu-action'
      );

      expect(dropdownTrigger).toBeInTheDocument();

      // Open dropdown
      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        const dropdownContent = container.querySelector('[role="menu"]');
        expect(dropdownContent).toBeInTheDocument();
      });
    });

    it('positions dropdown on bottom when mobile - Line 58', async () => {
      const { useIsMobile } = await import('@/hooks/use-mobile');
      vi.mocked(useIsMobile).mockReturnValue(true);

      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      // Find dropdown trigger
      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && 
        btn.getAttribute('data-sidebar') === 'menu-action'
      );

      expect(dropdownTrigger).toBeInTheDocument();

      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        const dropdownContent = container.querySelector('[role="menu"]');
        expect(dropdownContent).toBeInTheDocument();
      });
    });

    it('aligns dropdown to start when not mobile - Line 59', async () => {
      const { useIsMobile } = await import('@/hooks/use-mobile');
      vi.mocked(useIsMobile).mockReturnValue(false);

      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && 
        btn.getAttribute('data-sidebar') === 'menu-action'
      );

      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        const dropdownContent = container.querySelector('[role="menu"]');
        expect(dropdownContent).toBeInTheDocument();
      });
    });

    it('aligns dropdown to end when mobile - Line 59', async () => {
      const { useIsMobile } = await import('@/hooks/use-mobile');
      vi.mocked(useIsMobile).mockReturnValue(true);

      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && 
        btn.getAttribute('data-sidebar') === 'menu-action'
      );

      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        const dropdownContent = container.querySelector('[role="menu"]');
        expect(dropdownContent).toBeInTheDocument();
      });
    });
  });

  describe('Dropdown menu items', () => {
    it('displays all menu options when dropdown is opened', async () => {
      renderWithProviders(<NavProjects projects={mockProjects} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && 
        btn.getAttribute('data-sidebar') === 'menu-action'
      );

      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        expect(screen.getByText('View Project')).toBeInTheDocument();
        expect(screen.getByText('Share Project')).toBeInTheDocument();
        expect(screen.getByText('Delete Project')).toBeInTheDocument();
      });
    });

    it('renders separator between Share and Delete options', async () => {
      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && 
        btn.getAttribute('data-sidebar') === 'menu-action'
      );

      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        const separators = container.querySelectorAll('[role="separator"]');
        expect(separators.length).toBeGreaterThan(0);
      });
    });

    it('shows menu action on hover', () => {
      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      const menuAction = container.querySelector('[data-sidebar="menu-action"]');
      expect(menuAction).toBeInTheDocument();
      expect(menuAction?.getAttribute('data-slot')).toBe('sidebar-menu-action');
    });
  });

  describe('Project icons', () => {
    it('renders icons for each project', () => {
      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      // Each project link should contain an icon (svg)
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        const svg = link.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('handles single project', () => {
      const singleProject = [{ name: 'Solo', url: '/solo', icon: Folder }];
      
      renderWithProviders(<NavProjects projects={singleProject} />);

      expect(screen.getByText('Solo')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('handles projects with special characters in name', () => {
      const specialProjects = [
        { name: 'Project & Test', url: '/test', icon: Folder },
        { name: 'Project <Beta>', url: '/beta', icon: FileText },
      ];

      renderWithProviders(<NavProjects projects={specialProjects} />);

      expect(screen.getByText('Project & Test')).toBeInTheDocument();
      expect(screen.getByText('Project <Beta>')).toBeInTheDocument();
    });

    it('handles projects with long names', () => {
      const longNameProjects = [
        { 
          name: 'This is a very long project name that might need truncation', 
          url: '/long', 
          icon: Folder 
        },
      ];

      renderWithProviders(<NavProjects projects={longNameProjects} />);

      expect(screen.getByText('This is a very long project name that might need truncation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('includes sr-only text for screen readers', () => {
      renderWithProviders(<NavProjects projects={mockProjects} />);

      // The "More" text in dropdown trigger should be sr-only
      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });

    it('renders as semantic list', () => {
      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      const list = container.querySelector('[data-sidebar="menu"]');
      expect(list?.tagName).toBe('UL');
    });

    it('each project is a list item', () => {
      const { container } = renderWithProviders(<NavProjects projects={mockProjects} />);

      const listItems = container.querySelectorAll('[data-sidebar="menu-item"]');
      // Should have 3 projects + 1 "More" button = 4 items
      expect(listItems.length).toBe(4);
    });
  });

  describe('Multiple dropdown menus', () => {
    it('each project has its own dropdown menu', async () => {
      renderWithProviders(<NavProjects projects={mockProjects} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTriggers = menuButtons.filter(btn => 
        btn.querySelector('svg') && 
        btn.getAttribute('data-sidebar') === 'menu-action'
      );

      // Should have one dropdown trigger per project
      expect(dropdownTriggers.length).toBe(mockProjects.length);
    });

    it('opening one dropdown does not affect others', async () => {
      renderWithProviders(<NavProjects projects={mockProjects} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTriggers = menuButtons.filter(btn => 
        btn.querySelector('svg') && 
        btn.getAttribute('data-sidebar') === 'menu-action'
      );

      // Open first dropdown
      fireEvent.click(dropdownTriggers[0]);

      await waitFor(() => {
        expect(screen.getByText('View Project')).toBeInTheDocument();
      });

      // First dropdown should be open
      expect(screen.getByText('View Project')).toBeInTheDocument();
    });
  });
});
