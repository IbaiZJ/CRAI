import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NavUnified, UnifiedNavItem } from './NavUnified';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Home, Settings, Users, FileText } from 'lucide-react';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/home' })),
  };
});

// Helper to render component with required providers
const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  return render(
    <BrowserRouter>
      <SidebarProvider>
        {ui}
      </SidebarProvider>
    </BrowserRouter>,
    options
  );
};

describe('NavUnified', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Basic Rendering', () => {
    it('renders navigation items correctly', () => {
      const items: UnifiedNavItem[] = [
        { title: 'Home', url: '/home', icon: Home },
        { title: 'Settings', url: '/settings', icon: Settings },
      ];

      renderWithProviders(<NavUnified items={items} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      const items: UnifiedNavItem[] = [
        { title: 'Home', url: '/home' },
      ];

      renderWithProviders(<NavUnified items={items} label="Custom Menu" />);

      expect(screen.getByText('Custom Menu')).toBeInTheDocument();
    });

    it('renders with default label when not provided', () => {
      const items: UnifiedNavItem[] = [
        { title: 'Home', url: '/home' },
      ];

      renderWithProviders(<NavUnified items={items} />);

      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });
  });

  describe('Collapsible Items - Lines 56-68', () => {
    it('toggles collapsible item open and closed - Line 56-57', async () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Projects',
          url: '/projects',
          icon: FileText,
          navType: 'collapsible',
          items: [
            { title: 'Project 1', url: '/projects/1' },
            { title: 'Project 2', url: '/projects/2' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      const collapsibleTrigger = screen.getByText('Projects').closest('button');
      expect(collapsibleTrigger).toBeInTheDocument();

      // Initially closed - subitems should not be visible
      expect(screen.queryByText('Project 1')).not.toBeInTheDocument();

      // Click to open - Line 56
      fireEvent.click(collapsibleTrigger!);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
      });

      // Verify localStorage was updated - Line 57
      const savedState = localStorage.getItem('sidebar-collapsible-state');
      expect(savedState).toBeTruthy();
      const state = JSON.parse(savedState!);
      expect(state.Projects).toBe(true);

      // Click to close
      fireEvent.click(collapsibleTrigger!);

      await waitFor(() => {
        expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
      });
    });

    it('loads initial state from localStorage - Line 47-49', () => {
      const initialState = { Projects: true };
      localStorage.setItem('sidebar-collapsible-state', JSON.stringify(initialState));

      const items: UnifiedNavItem[] = [
        {
          title: 'Projects',
          url: '/projects',
          navType: 'collapsible',
          items: [
            { title: 'Project 1', url: '/projects/1' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      // Should be open based on localStorage
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    it('opens all tabs when Open All button is clicked - Line 61-68', async () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Projects',
          url: '/projects',
          navType: 'collapsible',
          items: [
            { title: 'Project 1', url: '/projects/1' },
          ],
        },
        {
          title: 'Users',
          url: '/users',
          navType: 'collapsible',
          items: [
            { title: 'User 1', url: '/users/1' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      // Initially closed
      expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
      expect(screen.queryByText('User 1')).not.toBeInTheDocument();

      // Find and click "Open all tabs" button
      const openAllButton = screen.getByTitle('Open all tabs');
      fireEvent.click(openAllButton);

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('User 1')).toBeInTheDocument();
      });

      // Verify all items are open in localStorage - Line 62-68
      const savedState = localStorage.getItem('sidebar-collapsible-state');
      expect(savedState).toBeTruthy();
      const state = JSON.parse(savedState!);
      expect(state.Projects).toBe(true);
      expect(state.Users).toBe(true);
    });

    it('closes all tabs when Close All button is clicked - Line 52-54', async () => {
      // Start with some tabs open
      const initialState = { Projects: true, Users: true };
      localStorage.setItem('sidebar-collapsible-state', JSON.stringify(initialState));

      const items: UnifiedNavItem[] = [
        {
          title: 'Projects',
          url: '/projects',
          navType: 'collapsible',
          items: [
            { title: 'Project 1', url: '/projects/1' },
          ],
        },
        {
          title: 'Users',
          url: '/users',
          navType: 'collapsible',
          items: [
            { title: 'User 1', url: '/users/1' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      // Initially open
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('User 1')).toBeInTheDocument();

      // Find and click "Close all tabs" button
      const closeAllButton = screen.getByTitle('Close all tabs');
      fireEvent.click(closeAllButton);

      await waitFor(() => {
        expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
      });

      // Verify state is cleared - Line 53
      const savedState = localStorage.getItem('sidebar-collapsible-state');
      expect(savedState).toBe('{}');
    });

    it('handles navType collapsible with items - Line 99-100', () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Collapsible Item',
          url: '/collapsible',
          icon: FileText,
          navType: 'collapsible',
          items: [
            { title: 'Sub Item', url: '/collapsible/sub' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      // Should render as collapsible
      const trigger = screen.getByText('Collapsible Item').closest('button');
      expect(trigger).toBeInTheDocument();

      // Has chevron icon
      const chevron = trigger?.querySelector('svg');
      expect(chevron).toBeInTheDocument();
    });

    it('only opens collapsible items with items array - Line 63-65', async () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Has Items',
          url: '/has',
          navType: 'collapsible',
          items: [
            { title: 'Sub 1', url: '/has/1' },
          ],
        },
        {
          title: 'No Items',
          url: '/no-items',
          navType: 'collapsible',
          items: [],
        },
        {
          title: 'Button Item',
          url: '/button',
          navType: 'button',
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      // Click Open All
      const openAllButton = screen.getByTitle('Open all tabs');
      fireEvent.click(openAllButton);

      await waitFor(() => {
        const savedState = localStorage.getItem('sidebar-collapsible-state');
        const state = JSON.parse(savedState!);
        
        // Only item with items array should be opened - Line 63
        expect(state['Has Items']).toBe(true);
        expect(state['No Items']).toBeUndefined();
        expect(state['Button Item']).toBeUndefined();
      });
    });
  });

  describe('Sub-items rendering - Line 126', () => {
    it('highlights active sub-item based on current pathname - Line 126', async () => {
      const useLocation = await import('react-router-dom').then(mod => mod.useLocation);
      vi.mocked(useLocation).mockReturnValue({ pathname: '/projects/1' } as any);

      const items: UnifiedNavItem[] = [
        {
          title: 'Projects',
          url: '/projects',
          navType: 'collapsible',
          isActive: true,
          items: [
            { title: 'Project 1', url: '/projects/1' },
            { title: 'Project 2', url: '/projects/2' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      await waitFor(() => {
        const project1Link = screen.getByText('Project 1').closest('a');
        const project2Link = screen.getByText('Project 2').closest('a');
        
        // Project 1 should have active class - Line 126
        expect(project1Link?.className).toContain('bg-accent');
        expect(project2Link?.className).not.toContain('bg-accent');
      });
    });
  });

  describe('Button mode items - Line 144', () => {
    it('highlights active button item based on pathname - Line 144', async () => {
      const useLocation = await import('react-router-dom').then(mod => mod.useLocation);
      vi.mocked(useLocation).mockReturnValue({ pathname: '/settings' } as any);

      const items: UnifiedNavItem[] = [
        { title: 'Home', url: '/home', icon: Home },
        { title: 'Settings', url: '/settings', icon: Settings },
      ];

      renderWithProviders(<NavUnified items={items} />);

      const homeButton = screen.getByText('Home').closest('a');
      const settingsButton = screen.getByText('Settings').closest('a');

      // Settings should have active class - Line 144
      expect(settingsButton?.className).toContain('bg-accent');
      expect(homeButton?.className).not.toContain('bg-accent');
    });

    it('renders button without icon correctly', () => {
      const items: UnifiedNavItem[] = [
        { title: 'No Icon', url: '/no-icon' },
      ];

      renderWithProviders(<NavUnified items={items} />);

      const link = screen.getByText('No Icon');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Dropdown menu actions - Line 160-161', () => {
    it('renders dropdown menu when item has actions - Line 160-161', async () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Home',
          url: '/home',
          icon: Home,
          actions: [
            { label: 'Edit', icon: Settings },
            { label: 'Delete' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      // Find the dropdown trigger (chevron button)
      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && btn.getAttribute('data-state') !== undefined
      );

      expect(dropdownTrigger).toBeInTheDocument();

      // Open dropdown
      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        // Actions should be visible - Line 160-161
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    });

    it('renders action items with icons', async () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Item',
          url: '/item',
          actions: [
            { label: 'Action with icon', icon: Settings },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && btn.getAttribute('data-state') !== undefined
      );

      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        const actionItem = screen.getByText('Action with icon');
        const icon = actionItem.previousSibling;
        expect(icon).toBeInTheDocument();
      });
    });

    it('renders action items without icons', async () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Item',
          url: '/item',
          actions: [
            { label: 'Action without icon' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && btn.getAttribute('data-state') !== undefined
      );

      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        expect(screen.getByText('Action without icon')).toBeInTheDocument();
      });
    });

    it('renders separator when multiple actions exist', async () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Item',
          url: '/item',
          actions: [
            { label: 'Action 1' },
            { label: 'Action 2' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      const menuButtons = screen.getAllByRole('button');
      const dropdownTrigger = menuButtons.find(btn => 
        btn.querySelector('svg') && btn.getAttribute('data-state') !== undefined
      );

      fireEvent.click(dropdownTrigger!);

      await waitFor(() => {
        // Should render separator for multiple actions
        const separators = document.querySelectorAll('[role="separator"]');
        expect(separators.length).toBeGreaterThan(0);
      });
    });

    it('does not render dropdown when item has no actions', () => {
      const items: UnifiedNavItem[] = [
        { title: 'No Actions', url: '/no-actions', icon: Home },
      ];

      renderWithProviders(<NavUnified items={items} />);

      // Should only have the main navigation button, no dropdown trigger
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeLessThanOrEqual(3); // Only open/close all buttons
    });
  });

  describe('Edge cases', () => {
    it('handles empty items array', () => {
      renderWithProviders(<NavUnified items={[]} />);
      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    it('handles item with navType button explicitly set', () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Button Item',
          url: '/button',
          navType: 'button',
          icon: Home,
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      const link = screen.getByText('Button Item').closest('a');
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute('href')).toBe('/button');
    });

    it('handles collapsible item with isActive property', () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Active Collapsible',
          url: '/active',
          navType: 'collapsible',
          isActive: true,
          items: [
            { title: 'Sub', url: '/active/sub' },
          ],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      // Should be open based on isActive
      expect(screen.getByText('Sub')).toBeInTheDocument();
    });

    it('handles malformed localStorage data', () => {
      localStorage.setItem('sidebar-collapsible-state', 'invalid json');

      const items: UnifiedNavItem[] = [
        {
          title: 'Item',
          url: '/item',
          navType: 'collapsible',
          items: [
            { title: 'Sub', url: '/sub' },
          ],
        },
      ];

      // Should not crash
      expect(() => renderWithProviders(<NavUnified items={items} />)).not.toThrow();
    });

    it('handles item with empty actions array', () => {
      const items: UnifiedNavItem[] = [
        {
          title: 'Empty Actions',
          url: '/empty',
          actions: [],
        },
      ];

      renderWithProviders(<NavUnified items={items} />);

      const link = screen.getByText('Empty Actions');
      expect(link).toBeInTheDocument();
    });
  });
});
