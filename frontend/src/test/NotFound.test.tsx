import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock UI components
vi.mock('@/components/ui/empty', () => ({
  Empty: ({ children }: { children: React.ReactNode }) => <div data-testid="empty">{children}</div>,
  EmptyContent: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-content">{children}</div>,
  EmptyDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="empty-description">{children}</p>,
  EmptyHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="empty-header">{children}</div>,
  EmptyTitle: ({ children }: { children: React.ReactNode }) => <h1 data-testid="empty-title">{children}</h1>,
}));

vi.mock('@/components/ui/input-group', () => ({
  InputGroup: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="input-group" className={className}>{children}</div>
  ),
  InputGroupAddon: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="input-addon">{children}</div>
  ),
  InputGroupInput: ({ onKeyDown, placeholder }: { onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; placeholder?: string }) => (
    <input data-testid="search-input" onKeyDown={onKeyDown} placeholder={placeholder} />
  ),
}));

vi.mock('@/components/ui/kbd', () => ({
  Kbd: ({ children }: { children: React.ReactNode }) => <kbd data-testid="kbd">{children}</kbd>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: string }) => (
    <button data-testid={variant === 'outline' ? 'btn-outline' : 'btn-default'} onClick={onClick}>
      {children}
    </button>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import NotFound from '@/pages/NotFound';

describe('NotFound Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
  });

  it('should render the 404 page', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByTestId('empty-title')).toHaveTextContent('404 - Page Not Found');
  });

  it('should set document title', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(document.title).toBe('CRAI - 404 Not Found');
  });

  it('should display search input with placeholder', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Try searching for pages...');
  });

  it('should display description text', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(screen.getByTestId('empty-description')).toHaveTextContent(
      "The page you're looking for doesn't exist. Try searching for what you need below or go back home."
    );
  });

  it('should navigate to search query on Enter key', async () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'dashboard' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should navigate to home when clicking Go Home button', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const homeButton = screen.getByTestId('btn-default');
    await user.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate back when clicking Go Back button', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const backButton = screen.getByTestId('btn-outline');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should display keyboard shortcut indicator', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(screen.getByTestId('kbd')).toHaveTextContent('/');
  });

  it('should not navigate when pressing other keys', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const searchInput = screen.getByTestId('search-input');
    fireEvent.keyDown(searchInput, { key: 'Tab', code: 'Tab' });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
