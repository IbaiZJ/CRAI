import { describe, it, expect, beforeEach } from 'vitest';
import { getCookie, setCookie, deleteCookie } from '@/lib/cookies';

describe('Cookie utilities', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
  });

  describe('setCookie', () => {
    it('should set a cookie with default expiration', () => {
      setCookie('testCookie', 'testValue');
      
      const value = getCookie('testCookie');
      expect(value).toBe('testValue');
    });

    it('should set a cookie with custom expiration days', () => {
      setCookie('customCookie', 'customValue', 30);
      
      const value = getCookie('customCookie');
      expect(value).toBe('customValue');
    });

    it('should encode special characters in cookie value', () => {
      const specialValue = 'test value with spaces & symbols';
      setCookie('specialCookie', specialValue);
      
      const value = getCookie('specialCookie');
      expect(value).toBe(specialValue);
    });

    it('should handle JSON strings as values', () => {
      const jsonValue = JSON.stringify({ name: 'John', age: 30 });
      setCookie('jsonCookie', jsonValue);
      
      const value = getCookie('jsonCookie');
      expect(value).toBe(jsonValue);
      expect(JSON.parse(value!)).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('getCookie', () => {
    it('should retrieve an existing cookie', () => {
      setCookie('existingCookie', 'value123');
      
      const value = getCookie('existingCookie');
      expect(value).toBe('value123');
    });

    it('should return null for non-existent cookie', () => {
      const value = getCookie('nonExistentCookie');
      expect(value).toBeNull();
    });

    it('should handle cookies with similar names correctly', () => {
      setCookie('cookie', 'value1');
      setCookie('cookie2', 'value2');
      setCookie('mycookie', 'value3');
      
      expect(getCookie('cookie')).toBe('value1');
      expect(getCookie('cookie2')).toBe('value2');
      expect(getCookie('mycookie')).toBe('value3');
    });

    it('should decode encoded cookie values', () => {
      const encodedValue = 'hello%20world';
      document.cookie = `encodedCookie=${encodedValue};path=/`;
      
      const value = getCookie('encodedCookie');
      expect(value).toBe('hello world');
    });
  });

  describe('deleteCookie', () => {
    it('should delete an existing cookie', () => {
      setCookie('deletableCookie', 'tempValue');
      expect(getCookie('deletableCookie')).toBe('tempValue');
      
      deleteCookie('deletableCookie');
      
      const value = getCookie('deletableCookie');
      expect(value).toBeNull();
    });

    it('should not throw error when deleting non-existent cookie', () => {
      expect(() => deleteCookie('nonExistent')).not.toThrow();
    });

    it('should delete only the specified cookie', () => {
      setCookie('cookie1', 'value1');
      setCookie('cookie2', 'value2');
      setCookie('cookie3', 'value3');
      
      deleteCookie('cookie2');
      
      expect(getCookie('cookie1')).toBe('value1');
      expect(getCookie('cookie2')).toBeNull();
      expect(getCookie('cookie3')).toBe('value3');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle user authentication flow', () => {
      const user = JSON.stringify({ username: 'john', name: 'John Doe' });
      const token = 'abc123token';
      
      setCookie('user', user, 7);
      setCookie('token', token, 7);
      
      expect(getCookie('user')).toBe(user);
      expect(getCookie('token')).toBe(token);
      
      deleteCookie('user');
      deleteCookie('token');
      
      expect(getCookie('user')).toBeNull();
      expect(getCookie('token')).toBeNull();
    });

    it('should update cookie value when set again', () => {
      setCookie('updateCookie', 'initialValue');
      expect(getCookie('updateCookie')).toBe('initialValue');
      
      setCookie('updateCookie', 'updatedValue');
      expect(getCookie('updateCookie')).toBe('updatedValue');
    });
  });
});
