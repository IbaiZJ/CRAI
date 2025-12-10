import { describe, it, expect } from 'vitest';
import { getToastOptions, TOAST_CONFIG } from '@/lib/toast-config';

describe('toast-config', () => {
  it('should export TOAST_CONFIG with correct structure', () => {
    expect(TOAST_CONFIG).toBeDefined();
    expect(TOAST_CONFIG.position).toBe('bottom-right');
    expect(TOAST_CONFIG.expand).toBe(true);
    expect(TOAST_CONFIG.richColors).toBe(true);
  });

  it('should have correct duration values', () => {
    expect(TOAST_CONFIG.duration.success).toBe(3000);
    expect(TOAST_CONFIG.duration.error).toBe(4000);
    expect(TOAST_CONFIG.duration.info).toBe(3000);
    expect(TOAST_CONFIG.duration.warning).toBe(3000);
  });

  it('should return toast options for success type', () => {
    const options = getToastOptions('success');
    expect(options.duration).toBe(3000);
  });

  it('should return toast options for error type', () => {
    const options = getToastOptions('error');
    expect(options.duration).toBe(4000);
  });

  it('should return toast options for info type', () => {
    const options = getToastOptions('info');
    expect(options.duration).toBe(3000);
  });

  it('should return toast options for warning type', () => {
    const options = getToastOptions('warning');
    expect(options.duration).toBe(3000);
  });
});
