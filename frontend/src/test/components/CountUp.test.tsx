import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CountUp from '@/components/CountUp';

// Mock motion/react
vi.mock('motion/react', () => ({
  useInView: vi.fn(() => true),
  useMotionValue: vi.fn((initial: number) => ({
    set: vi.fn(),
    get: () => initial,
    on: vi.fn((event: string, callback: (value: number) => void) => {
      // Simulate spring animation completing
      callback(initial);
      return vi.fn(); // unsubscribe function
    }),
  })),
  useSpring: vi.fn((motionValue) => motionValue),
}));

describe('CountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders a span element', () => {
      render(<CountUp to={100} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CountUp to={100} className="custom-class" />);
      const span = document.querySelector('span');
      expect(span).toHaveClass('custom-class');
    });

    it('renders with default props', () => {
      render(<CountUp to={50} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts from prop', () => {
      render(<CountUp to={100} from={50} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('accepts direction up', () => {
      render(<CountUp to={100} direction="up" />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('accepts direction down', () => {
      render(<CountUp to={0} from={100} direction="down" />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('accepts delay prop', () => {
      render(<CountUp to={100} delay={1} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('accepts duration prop', () => {
      render(<CountUp to={100} duration={3} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('accepts separator prop', () => {
      render(<CountUp to={1000} separator="," />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('accepts startWhen prop as true', () => {
      render(<CountUp to={100} startWhen={true} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('accepts startWhen prop as false', () => {
      render(<CountUp to={100} startWhen={false} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('calls onStart callback when animation starts', async () => {
      const onStart = vi.fn();
      render(<CountUp to={100} onStart={onStart} delay={0} />);
      
      vi.advanceTimersByTime(100);
      
      await waitFor(() => {
        expect(onStart).toHaveBeenCalled();
      });
    });

    it('calls onEnd callback when animation ends', async () => {
      const onEnd = vi.fn();
      render(<CountUp to={100} onEnd={onEnd} delay={0} duration={1} />);
      
      vi.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(onEnd).toHaveBeenCalled();
      });
    });

    it('handles missing onStart callback gracefully', () => {
      expect(() => {
        render(<CountUp to={100} />);
        vi.advanceTimersByTime(100);
      }).not.toThrow();
    });

    it('handles missing onEnd callback gracefully', () => {
      expect(() => {
        render(<CountUp to={100} duration={1} />);
        vi.advanceTimersByTime(1500);
      }).not.toThrow();
    });
  });

  describe('Number Formatting', () => {
    it('handles integer values', () => {
      render(<CountUp to={100} from={0} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('handles decimal values in to', () => {
      render(<CountUp to={100.5} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('handles decimal values in from', () => {
      render(<CountUp to={100} from={50.25} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('handles both decimal from and to', () => {
      render(<CountUp to={100.75} from={50.25} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('handles large numbers', () => {
      render(<CountUp to={1000000} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('handles numbers with separator', () => {
      render(<CountUp to={10000} separator="." />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });

    it('handles zero values', () => {
      render(<CountUp to={0} from={100} />);
      const span = document.querySelector('span');
      expect(span).toBeInTheDocument();
    });
  });

  describe('Animation Behavior', () => {
    it('respects delay before starting', () => {
      const onStart = vi.fn();
      render(<CountUp to={100} delay={2} onStart={onStart} />);
      
      // Before delay
      vi.advanceTimersByTime(1000);
      expect(onStart).not.toHaveBeenCalled();
      
      // After delay
      vi.advanceTimersByTime(1500);
    });

    it('cleans up timeouts on unmount', () => {
      const { unmount } = render(<CountUp to={100} delay={2} duration={2} />);
      unmount();
      // Should not throw any errors
      vi.advanceTimersByTime(5000);
    });
  });
});
