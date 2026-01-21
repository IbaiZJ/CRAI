import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SplitText from '@/components/SplitText';

// Mock GSAP and related plugins
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(() => ({ kill: vi.fn() })),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => []),
  },
}));

vi.mock('gsap/SplitText', () => ({
  SplitText: vi.fn().mockImplementation(() => ({
    chars: [],
    words: [],
    lines: [],
    revert: vi.fn(),
  })),
}));

vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn((callback: () => () => void, options: { dependencies: unknown[] }) => {
    // Execute the callback on mount
  }),
}));

describe('SplitText', () => {
  beforeEach(() => {
    // Mock document.fonts
    Object.defineProperty(document, 'fonts', {
      value: {
        status: 'loaded',
        ready: Promise.resolve(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default p tag', () => {
    render(<SplitText text="Hello World" />);
    const element = screen.getByText('Hello World');
    expect(element.tagName).toBe('P');
  });

  it('renders with h1 tag', () => {
    render(<SplitText text="Heading 1" tag="h1" />);
    const element = screen.getByText('Heading 1');
    expect(element.tagName).toBe('H1');
  });

  it('renders with h2 tag', () => {
    render(<SplitText text="Heading 2" tag="h2" />);
    const element = screen.getByText('Heading 2');
    expect(element.tagName).toBe('H2');
  });

  it('renders with h3 tag', () => {
    render(<SplitText text="Heading 3" tag="h3" />);
    const element = screen.getByText('Heading 3');
    expect(element.tagName).toBe('H3');
  });

  it('renders with h4 tag', () => {
    render(<SplitText text="Heading 4" tag="h4" />);
    const element = screen.getByText('Heading 4');
    expect(element.tagName).toBe('H4');
  });

  it('renders with h5 tag', () => {
    render(<SplitText text="Heading 5" tag="h5" />);
    const element = screen.getByText('Heading 5');
    expect(element.tagName).toBe('H5');
  });

  it('renders with h6 tag', () => {
    render(<SplitText text="Heading 6" tag="h6" />);
    const element = screen.getByText('Heading 6');
    expect(element.tagName).toBe('H6');
  });

  it('renders with span tag', () => {
    render(<SplitText text="Inline Text" tag="span" />);
    const element = screen.getByText('Inline Text');
    expect(element.tagName).toBe('P'); // span falls through to default
  });

  it('applies custom className', () => {
    render(<SplitText text="Styled Text" className="custom-class" />);
    const element = screen.getByText('Styled Text');
    expect(element).toHaveClass('custom-class');
  });

  it('applies text alignment style', () => {
    render(<SplitText text="Left Aligned" textAlign="left" />);
    const element = screen.getByText('Left Aligned');
    expect(element).toHaveStyle({ textAlign: 'left' });
  });

  it('applies center text alignment by default', () => {
    render(<SplitText text="Centered Text" />);
    const element = screen.getByText('Centered Text');
    expect(element).toHaveStyle({ textAlign: 'center' });
  });

  it('has split-parent class', () => {
    render(<SplitText text="Test" />);
    const element = screen.getByText('Test');
    expect(element).toHaveClass('split-parent');
  });

  it('has overflow-hidden class', () => {
    render(<SplitText text="Test" />);
    const element = screen.getByText('Test');
    expect(element).toHaveClass('overflow-hidden');
  });

  it('renders the text content', () => {
    render(<SplitText text="The quick brown fox" />);
    expect(screen.getByText('The quick brown fox')).toBeInTheDocument();
  });

  it('handles empty text', () => {
    render(<SplitText text="" />);
    const elements = document.querySelectorAll('.split-parent');
    expect(elements.length).toBe(1);
    expect(elements[0].textContent).toBe('');
  });

  it('handles special characters', () => {
    render(<SplitText text="Hello! @#$%" />);
    expect(screen.getByText('Hello! @#$%')).toBeInTheDocument();
  });

  it('re-renders when text changes', () => {
    const { rerender } = render(<SplitText text="Initial" />);
    expect(screen.getByText('Initial')).toBeInTheDocument();
    
    rerender(<SplitText text="Updated" />);
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
