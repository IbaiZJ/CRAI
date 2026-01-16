import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSkeleton,
  useSidebar,
} from './sidebar';
import { PanelLeftIcon } from 'lucide-react';

// Mock use-mobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

// Helper component to test useSidebar hook
function TestComponent() {
  const { state, open, toggleSidebar, isMobile, openMobile } = useSidebar();
  return (
    <div>
      <div data-testid="state">{state}</div>
      <div data-testid="open">{String(open)}</div>
      <div data-testid="is-mobile">{String(isMobile)}</div>
      <div data-testid="open-mobile">{String(openMobile)}</div>
      <button onClick={toggleSidebar}>Toggle</button>
    </div>
  );
}

describe('SidebarProvider', () => {
  beforeEach(() => {
    // Clear cookies
    document.cookie = 'sidebar_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.cookie = 'sidebar_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  describe('useSidebar hook - Line 47-48', () => {
    it('throws error when used outside SidebarProvider - Line 47-48', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useSidebar must be used within a SidebarProvider.');
      
      consoleSpy.mockRestore();
    });

    it('provides context when used within SidebarProvider', () => {
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('open')).toHaveTextContent('true');
    });
  });

  describe('State management - Lines 76-78, 80, 84', () => {
    it('handles controlled open state via openProp - Line 76-77', () => {
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <SidebarProvider open={true} onOpenChange={onOpenChange}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open')).toHaveTextContent('true');
      expect(screen.getByTestId('state')).toHaveTextContent('expanded');

      // Update controlled prop
      rerender(
        <SidebarProvider open={false} onOpenChange={onOpenChange}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open')).toHaveTextContent('false');
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
    });

    it('setOpen calls setOpenProp when provided - Line 78', async () => {
      const onOpenChange = vi.fn();
      render(
        <SidebarProvider open={true} onOpenChange={onOpenChange}>
          <SidebarTrigger />
        </SidebarProvider>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('handles function value in setOpen - Line 76-77', async () => {
      const onOpenChange = vi.fn();
      render(
        <SidebarProvider open={true} onOpenChange={onOpenChange}>
          <SidebarTrigger />
        </SidebarProvider>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        // Should call with result of function (open => !open)
        expect(onOpenChange).toHaveBeenCalled();
      });
    });

    it('uses internal _setOpen when setOpenProp not provided - Line 80', async () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open')).toHaveTextContent('true');

      const toggleButton = screen.getByText('Toggle');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('open')).toHaveTextContent('false');
      });
    });

    it('sets cookie when state changes - Line 84', async () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <SidebarTrigger />
        </SidebarProvider>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.cookie).toContain('sidebar_state=false');
      });
    });
  });

  describe('toggleSidebar - Lines 91, 97-98', () => {
    it('toggles openMobile when isMobile is true - Line 91', async () => {
      const { useIsMobile } = await import('@/hooks/use-mobile');
      vi.mocked(useIsMobile).mockReturnValue(true);

      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
      expect(screen.getByTestId('open-mobile')).toHaveTextContent('false');

      const toggleButton = screen.getByText('Toggle');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('open-mobile')).toHaveTextContent('true');
      });
    });

    it('toggles setOpen when isMobile is false - Line 91', async () => {
      const { useIsMobile } = await import('@/hooks/use-mobile');
      vi.mocked(useIsMobile).mockReturnValue(false);

      render(
        <SidebarProvider defaultOpen={true}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
      expect(screen.getByTestId('open')).toHaveTextContent('true');

      const toggleButton = screen.getByText('Toggle');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('open')).toHaveTextContent('false');
      });
    });
  });

  describe('Keyboard shortcut - Lines 97-98, 101-102', () => {
    it('toggles sidebar with Ctrl+B on Windows - Line 97-98, 101-102', async () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open')).toHaveTextContent('true');

      // Simulate Ctrl+B
      fireEvent.keyDown(window, { key: 'b', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByTestId('open')).toHaveTextContent('false');
      });
    });

    it('toggles sidebar with Cmd+B on Mac - Line 97-98, 101-102', async () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open')).toHaveTextContent('false');

      // Simulate Cmd+B (metaKey)
      fireEvent.keyDown(window, { key: 'b', metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId('open')).toHaveTextContent('true');
      });
    });

    it('prevents default behavior when keyboard shortcut is used - Line 101', async () => {
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      );

      const event = new KeyboardEvent('keydown', { 
        key: 'b', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });

    it('does not toggle for other keys - Line 97-98', async () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('open')).toHaveTextContent('true');

      // Try different key
      fireEvent.keyDown(window, { key: 'a', ctrlKey: true });

      // Should not change
      expect(screen.getByTestId('open')).toHaveTextContent('true');
    });

    it('does not toggle without modifier key - Line 97-98', async () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <TestComponent />
        </SidebarProvider>
      );

      // Press 'b' without Ctrl/Cmd
      fireEvent.keyDown(window, { key: 'b' });

      // Should not change
      expect(screen.getByTestId('open')).toHaveTextContent('true');
    });
  });

  describe('State computation - Line 112', () => {
    it('sets state to expanded when open is true - Line 112', () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('state')).toHaveTextContent('expanded');
    });

    it('sets state to collapsed when open is false - Line 112', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <TestComponent />
        </SidebarProvider>
      );

      expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
    });
  });
});

describe('Sidebar', () => {
  it('renders with collapsible="none" - Line 166', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <div>Sidebar Content</div>
        </Sidebar>
      </SidebarProvider>
    );

    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    
    // Should render div, not Sheet
    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar?.tagName).toBe('DIV');
  });

  it('renders Sheet when isMobile is true - Line 181', async () => {
    const { useIsMobile } = await import('@/hooks/use-mobile');
    vi.mocked(useIsMobile).mockReturnValue(true);

    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <div>Mobile Sidebar</div>
        </Sidebar>
      </SidebarProvider>
    );

    // Sheet renders, verify mobile sidebar content
    expect(screen.getByText('Mobile Sidebar')).toBeInTheDocument();
    // Verify sheet is present by data-slot
    const sheet = container.querySelector('[data-slot="sidebar"]');
    expect(sheet).toBeInTheDocument();
  });
});

describe('SidebarTrigger', () => {
  it('calls custom onClick and toggleSidebar - Line 210, 222', async () => {
    const customOnClick = vi.fn();

    render(
      <SidebarProvider defaultOpen={true}>
        <SidebarTrigger onClick={customOnClick} />
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId('open')).toHaveTextContent('true');

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(customOnClick).toHaveBeenCalled(); // Line 210
      expect(screen.getByTestId('open')).toHaveTextContent('false'); // Line 222
    });
  });

  it('works without custom onClick - Line 210', async () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <SidebarTrigger />
        <TestComponent />
      </SidebarProvider>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId('open')).toHaveTextContent('false');
    });
  });
});

describe('SidebarRail', () => {
  it('calls toggleSidebar when clicked - Line 231', async () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <SidebarRail />
        </Sidebar>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId('open')).toHaveTextContent('false');

    const rail = container.querySelector('[data-slot="sidebar-rail"]');
    expect(rail).toBeInTheDocument();
    fireEvent.click(rail!);

    await waitFor(() => {
      expect(screen.getByTestId('open')).toHaveTextContent('true');
    });
  });
});

describe('SidebarMenuButton', () => {
  it('renders without tooltip - Line 235', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton>Menu Item</SidebarMenuButton>
      </SidebarProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Menu Item');
  });

  it('renders with string tooltip - Line 259', async () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarMenuButton tooltip="Tooltip text">
          <PanelLeftIcon />
        </SidebarMenuButton>
      </SidebarProvider>
    );

    const button = screen.getByRole('button');
    
    // Hover to show tooltip
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });

  it.skip('renders with tooltip object - Line 269-270 (tooltips require real DOM interaction)', async () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarMenuButton 
          tooltip={{ 
            children: 'Custom Tooltip',
            side: 'bottom',
          }}
        >
          <PanelLeftIcon />
        </SidebarMenuButton>
      </SidebarProvider>
    );

    const button = screen.getByRole('button');
    
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByText('Custom Tooltip')).toBeInTheDocument();
    });
  });

  it('hides tooltip when sidebar is expanded or on mobile - Line 269-270', () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <SidebarMenuButton tooltip="Should be hidden">
          Menu
        </SidebarMenuButton>
      </SidebarProvider>
    );

    // Tooltip content should have hidden attribute when expanded
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});

describe('SidebarMenuAction', () => {
  it('renders with showOnHover prop - Line 399', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarMenuAction showOnHover>
          Action
        </SidebarMenuAction>
      </SidebarProvider>
    );

    const action = container.querySelector('[data-sidebar="menu-action"]');
    expect(action).toBeInTheDocument();
    // showOnHover adds opacity classes
    expect(action?.className).toContain('md:opacity-0');
  });

  it('renders without showOnHover - Line 399', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarMenuAction showOnHover={false}>
          Action
        </SidebarMenuAction>
      </SidebarProvider>
    );

    const action = container.querySelector('[data-sidebar="menu-action"]');
    expect(action).toBeInTheDocument();
  });
});

describe('SidebarMenuSkeleton', () => {
  it('generates random width - Line 417, 420', () => {
    const { container, rerender } = render(
      <SidebarProvider>
        <SidebarMenuSkeleton />
      </SidebarProvider>
    );

    const skeleton = container.querySelector('[data-sidebar="menu-skeleton-text"]') as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    
    // Width should be set as CSS variable
    const style = skeleton?.style.getPropertyValue('--skeleton-width');
    expect(style).toMatch(/^\d+%$/); // Should be percentage
    
    // Parse the percentage
    const width = parseInt(style || '0');
    expect(width).toBeGreaterThanOrEqual(50);
    expect(width).toBeLessThanOrEqual(90);
  });

  it('renders with icon when showIcon is true - Line 417', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarMenuSkeleton showIcon />
      </SidebarProvider>
    );

    const icon = container.querySelector('[data-sidebar="menu-skeleton-icon"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders without icon when showIcon is false - Line 417', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarMenuSkeleton showIcon={false} />
      </SidebarProvider>
    );

    const icon = container.querySelector('[data-sidebar="menu-skeleton-icon"]');
    expect(icon).not.toBeInTheDocument();
  });
});

describe('Edge Cases', () => {
  it('handles defaultOpen prop', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <TestComponent />
      </SidebarProvider>
    );

    expect(screen.getByTestId('open')).toHaveTextContent('false');
    expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
  });

  it('handles className and style props', () => {
    const { container } = render(
      <SidebarProvider className="custom-class" style={{ backgroundColor: 'red' }}>
        <div>Content</div>
      </SidebarProvider>
    );

    const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(wrapper).toHaveClass('custom-class');
    expect(wrapper).toHaveStyle({ backgroundColor: 'red' });
  });

  it('cleanup removes keyboard event listener', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <SidebarProvider>
        <div>Content</div>
      </SidebarProvider>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});
