import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/layouts/Layout', () => ({
  default: ({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs?: { label: string; to?: string }[] }) => (
    <div data-testid="layout">
      <nav data-testid="breadcrumbs">
        {breadcrumbs?.map((b, i) => (
          <span key={i} data-testid={`breadcrumb-${i}`}>{b.label}</span>
        ))}
      </nav>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="card-title">{children}</h3>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}));

import Cameras from '@/pages/Cameras';

describe('Cameras Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
    
    // Mock fetch to return camera data
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 'CAM-001', name: 'Main Entrance', location: 'Lobby', status: 'online', quality: '4K', fps: 30 },
        { id: 'CAM-002', name: 'Parking Lot', location: 'Exterior - North', status: 'online', quality: '1080p', fps: 60 },
        { id: 'CAM-003', name: 'Server Room', location: 'Floor 2', status: 'maintenance', quality: '1080p', fps: 30 },
        { id: 'CAM-004', name: 'Emergency Exit', location: 'Stairwell B', status: 'offline', quality: '720p', fps: 30 },
        { id: 'CAM-005', name: 'Reception', location: 'Ground Floor', status: 'online', quality: '4K', fps: 60 },
        { id: 'CAM-006', name: 'Conference Room A', location: 'Floor 3', status: 'online', quality: '1080p', fps: 30 },
      ],
    });
  });

  it('should render the cameras page', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cameras', level: 1 })).toBeInTheDocument();
    });
  });

  it('should set document title', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(document.title).toBe('CRAI - Cameras');
    });
  });

  it('should display correct breadcrumbs', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('breadcrumb-1')).toHaveTextContent('Cameras');
  });

  it('should display page description', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Monitor and manage all security cameras')).toBeInTheDocument();
    });
  });

  it('should display Total Cameras stat', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Cameras')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });
  });

  it('should display Online cameras stat card', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    // Wait for data to load and stat card title and online cameras badges
    await waitFor(() => {
      const onlineElements = screen.getAllByText('Online');
      expect(onlineElements.length).toBeGreaterThan(0);
    });
  });

  it('should display Offline stat card', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    // Wait for data to load - stat card title and offline camera badge
    await waitFor(() => {
      const offlineElements = screen.getAllByText('Offline');
      expect(offlineElements.length).toBeGreaterThan(0);
    });
  });

  it('should display Maintenance stat card', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Maintenance').length).toBeGreaterThan(0);
    });
  });

  it('should display camera CAM-001', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('CAM-001')).toBeInTheDocument();
      expect(screen.getByText('Main Entrance')).toBeInTheDocument();
    });
  });

  it('should display camera CAM-002', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('CAM-002')).toBeInTheDocument();
      expect(screen.getByText('Parking Lot')).toBeInTheDocument();
      expect(screen.getByText('Exterior - North')).toBeInTheDocument();
    });
  });

  it('should display camera CAM-003 in maintenance', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('CAM-003')).toBeInTheDocument();
      expect(screen.getByText('Server Room')).toBeInTheDocument();
    });
  });

  it('should display camera CAM-004 offline', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('CAM-004')).toBeInTheDocument();
      expect(screen.getByText('Emergency Exit')).toBeInTheDocument();
    });
  });

  it('should display camera CAM-005', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('CAM-005')).toBeInTheDocument();
      expect(screen.getByText('Reception')).toBeInTheDocument();
    });
  });

  it('should display camera CAM-006', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('CAM-006')).toBeInTheDocument();
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    });
  });

  it('should display status badges', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('should display camera quality specifications', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('1080p').length).toBeGreaterThan(0);
      expect(screen.getAllByText('4K').length).toBeGreaterThan(0);
      expect(screen.getByText('720p')).toBeInTheDocument();
    });
  });

  it('should display camera FPS specifications', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('30 FPS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('60 FPS').length).toBeGreaterThan(0);
    });
  });
});
