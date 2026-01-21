import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import CountUp from '@/components/CountUp';

// Mock motion/react
vi.mock('motion/react', () => ({
  useInView: vi.fn(() => true),
  useMotionValue: vi.fn((initial: number) => {
    const listeners: ((value: number) => void)[] = [];
    return {
      get: () => initial,
      set: vi.fn((value: number) => {
        listeners.forEach(fn => fn(value));
      }),
      on: vi.fn((event: string, callback: (value: number) => void) => {
        listeners.push(callback);
        // Immediately call with initial value
        callback(initial);
        return () => {
          const idx = listeners.indexOf(callback);
          if (idx > -1) listeners.splice(idx, 1);
        };
      }),
    };
  }),
  useSpring: vi.fn((motionValue: { get: () => number; on: (event: string, fn: (v: number) => void) => () => void }) => motionValue),
}));

describe('CountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders a span element', () => {
    render(<CountUp to={100} />);
    const span = document.querySelector('span');
    expect(span).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CountUp to={100} className="custom-count" />);
    const span = document.querySelector('span.custom-count');
    expect(span).toBeInTheDocument();
  });

  it('renders initial value based on direction up', () => {
    render(<CountUp to={100} from={0} direction="up" />);
    const span = document.querySelector('span');
    expect(span?.textContent).toBe('0');
  });

  it('renders initial value based on direction down', () => {
    render(<CountUp to={100} from={0} direction="down" />);
    const span = document.querySelector('span');
    expect(span?.textContent).toBe('100');
  });

  it('formats numbers with separator', () => {
    render(<CountUp to={1000} from={1000} separator="," />);
    const span = document.querySelector('span');
    expect(span?.textContent).toBe('1,000');
  });

  it('handles decimal numbers', () => {
    render(<CountUp to={10.55} from={10.55} />);
    const span = document.querySelector('span');
    expect(span?.textContent).toBe('10.55');
  });

  it('calls onStart when animation starts', async () => {
    const onStart = vi.fn();
    render(<CountUp to={100} onStart={onStart} startWhen={true} />);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(onStart).toHaveBeenCalled();
  });

  it('calls onEnd after animation completes', async () => {
    const onEnd = vi.fn();
    render(<CountUp to={100} onEnd={onEnd} duration={1} delay={0} />);
    
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    expect(onEnd).toHaveBeenCalled();
  });

  it('respects delay before starting animation', async () => {
    const onStart = vi.fn();
    render(<CountUp to={100} onStart={onStart} delay={1} />);
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(onStart).toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('does not start when startWhen is false', () => {
    const onStart = vi.fn();
    render(<CountUp to={100} onStart={onStart} startWhen={false} />);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(onStart).not.toHaveBeenCalled();
  });

  it('handles different duration values', () => {
    const { rerender } = render(<CountUp to={100} duration={1} />);
    expect(document.querySelector('span')).toBeInTheDocument();
    
    rerender(<CountUp to={100} duration={5} />);
    expect(document.querySelector('span')).toBeInTheDocument();
  });

  it('updates when from value changes', () => {
    const { rerender } = render(<CountUp to={100} from={0} />);
    const span = document.querySelector('span');
    expect(span?.textContent).toBe('0');
    
    rerender(<CountUp to={100} from={50} />);
    expect(span?.textContent).toBe('50');
  });
});
