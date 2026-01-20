import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Home, { FadeIn, Button as HomeButton } from '../pages/Home';

describe('Home Component', () => {
  beforeEach(() => {
    document.title = '';
  });

  it('renders home page successfully', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Verifica que el componente se renderiza y tiene contenido
    expect(container).toBeTruthy();
    expect(container.textContent).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Verifica que el div principal existe
    expect(container.firstChild).toBeTruthy();
  });

  it('renders FadeIn with default delay', async () => {
    vi.useFakeTimers();

    render(
      <FadeIn>
        <span>FadeIn content</span>
      </FadeIn>
    );

    const wrapper = screen.getByText('FadeIn content').parentElement as HTMLElement;
    expect(wrapper).toHaveClass('opacity-0');

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(wrapper).toHaveClass('opacity-100');
    vi.useRealTimers();
  });

  it('renders Button with default variant and className', () => {
    render(<HomeButton>Plain Button</HomeButton>);

    const button = screen.getByRole('button', { name: 'Plain Button' });
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('sets the document title on module load', async () => {
    document.title = '';
    vi.resetModules();
    await import('../pages/Home');
    expect(document.title).toBe('CRAI - Home');
  });

  it('does not throw when document is undefined', async () => {
    vi.resetModules();
    vi.stubGlobal('document', undefined);

    await import('../pages/Home');

    vi.unstubAllGlobals();
  });

  it('reveals FadeIn content after the delay', async () => {
    vi.useFakeTimers();

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const marker = screen.getByText('Next Gen ANPR Technology');
    let fadeWrapper: HTMLElement | null = marker as HTMLElement;
    while (fadeWrapper && !fadeWrapper.className.includes('transition-all')) {
      fadeWrapper = fadeWrapper.parentElement;
    }

    expect(fadeWrapper).not.toBeNull();
    expect(fadeWrapper).toHaveClass('opacity-0');

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(fadeWrapper).toHaveClass('opacity-100');
    vi.useRealTimers();
  });

  it('navigates to dashboard when clicking Get Started', async () => {
    const user = userEvent.setup();
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
      configurable: true,
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await user.click(screen.getByRole('button', { name: /get started/i }));

    expect(window.location.href).toBe('/dashboard');

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });
});
