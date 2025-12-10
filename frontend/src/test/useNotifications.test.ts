import { describe, it, expect, vi, afterEach } from 'vitest';
import { useNotifications } from '@/hooks/useNotifications';
import { renderHook } from '@testing-library/react';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
  },
}));

vi.mock('@/lib/toast-config', () => ({
  getToastOptions: vi.fn(() => ({ duration: 3000 })),
}));

describe('useNotifications', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call toast.success with message and description', () => {
    const { result } = renderHook(() => useNotifications());
    
    result.current.success('Success Message', 'Success Description');

    expect(toast.success).toHaveBeenCalledWith(
      'Success Message',
      expect.objectContaining({
        description: 'Success Description',
      })
    );
  });

  it('should call toast.success without description', () => {
    const { result } = renderHook(() => useNotifications());
    
    result.current.success('Success Message');

    expect(toast.success).toHaveBeenCalledWith(
      'Success Message',
      expect.any(Object)
    );
  });

  it('should call toast.error with message and description', () => {
    const { result } = renderHook(() => useNotifications());
    
    result.current.error('Error Message', 'Error Description');

    expect(toast.error).toHaveBeenCalledWith(
      'Error Message',
      expect.objectContaining({
        description: 'Error Description',
      })
    );
  });

  it('should call toast.error without description', () => {
    const { result } = renderHook(() => useNotifications());
    
    result.current.error('Error Message');

    expect(toast.error).toHaveBeenCalledWith(
      'Error Message',
      expect.any(Object)
    );
  });

  it('should call toast.info with message and description', () => {
    const { result } = renderHook(() => useNotifications());
    
    result.current.info('Info Message', 'Info Description');

    expect(toast.info).toHaveBeenCalledWith(
      'Info Message',
      expect.objectContaining({
        description: 'Info Description',
      })
    );
  });

  it('should call toast.info without description', () => {
    const { result } = renderHook(() => useNotifications());
    
    result.current.info('Info Message');

    expect(toast.info).toHaveBeenCalledWith(
      'Info Message',
      expect.any(Object)
    );
  });

  it('should call toast.warning with message and description', () => {
    const { result } = renderHook(() => useNotifications());
    
    result.current.warning('Warning Message', 'Warning Description');

    expect(toast.warning).toHaveBeenCalledWith(
      'Warning Message',
      expect.objectContaining({
        description: 'Warning Description',
      })
    );
  });

  it('should call toast.warning without description', () => {
    const { result } = renderHook(() => useNotifications());
    
    result.current.warning('Warning Message');

    expect(toast.warning).toHaveBeenCalledWith(
      'Warning Message',
      expect.any(Object)
    );
  });

  it('should call toast.promise with promise and messages', () => {
    const { result } = renderHook(() => useNotifications());
    const testPromise = Promise.resolve('test');

    result.current.promise(testPromise, {
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error!',
    });

    expect(toast.promise).toHaveBeenCalledWith(testPromise, {
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error!',
    });
  });
});
