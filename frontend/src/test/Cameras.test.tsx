import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock Leaflet to avoid DOM-specific implementation
const mockMap = {
  setView: vi.fn().mockReturnThis(),
  on: vi.fn(),
  remove: vi.fn(),
  fitBounds: vi.fn(),
};

const mockMarker = {
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
  on: vi.fn(),
  closePopup: vi.fn(),
};

vi.mock('leaflet', () => ({
  __esModule: true,
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => mockMarker),
    latLngBounds: vi.fn(() => ({})),
    Icon: {
      Default: {
        prototype: { _getIconUrl: vi.fn() },
        mergeOptions: vi.fn(),
      },
    },
  },
  map: vi.fn(() => mockMap),
  tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  marker: vi.fn(() => mockMarker),
  latLngBounds: vi.fn(() => ({})),
  Icon: {
    Default: {
      prototype: { _getIconUrl: vi.fn() },
      mergeOptions: vi.fn(),
    },
  },
}));

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

// Minimal mocks for components used inside page
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/MapPicker', () => ({ default: () => <div data-testid="map-picker" /> }));

import Cameras from '@/pages/Cameras';

describe('Cameras Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
    
    // Mock fetch to return camera data
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, locationX: 40.416775, locationY: -3.70379 },
        { id: 2, locationX: 40.417775, locationY: -3.70479 },
      ],
    });
  });

  it('should render the cameras page with loader then map', async () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    // Loader appears first
    expect(document.querySelector('.animate-spin')).toBeTruthy();

    // After fetch resolves, loader is removed and map initialization was attempted
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).toBeFalsy();
      expect(mockMap.setView).toHaveBeenCalled();
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

  it('should show Add Camera button', () => {
    render(
      <BrowserRouter>
        <Cameras />
      </BrowserRouter>
    );

    expect(screen.getByText('Add Camera')).toBeInTheDocument();
  });
});
