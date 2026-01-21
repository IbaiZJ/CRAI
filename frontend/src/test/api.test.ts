import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi } from '@/lib/api';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUsers = [
        {
          username: 'testuser',
          password: 'password123',
          name: 'Test',
          surname: 'User',
          email: 'test@example.com',
          picture: 'https://example.com/pic.jpg'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockUsers })
      });

      const result = await authApi.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toEqual({
        username: 'testuser',
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        picture: 'https://example.com/pic.jpg'
      });
    });

    it('should fail login with invalid credentials', async () => {
      const mockUsers = [
        {
          username: 'testuser',
          password: 'password123',
          name: 'Test',
          surname: 'User'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockUsers })
      });

      const result = await authApi.login({
        username: 'testuser',
        password: 'wrongpassword'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      const result = await authApi.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error: 500');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authApi.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle timeout errors', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      
      mockFetch.mockRejectedValueOnce(abortError);

      const result = await authApi.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should handle non-array response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const result = await authApi.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected response format');
    });

    it('should handle response without data wrapper', async () => {
      const mockUsers = [
        {
          username: 'testuser',
          password: 'password123',
          name: 'Test',
          surname: 'User'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUsers
      });

      const result = await authApi.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.success).toBe(true);
      expect(result.user?.username).toBe('testuser');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        success: true,
        user: {
          username: 'newuser',
          name: 'New',
          surname: 'User'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      });

      const result = await authApi.register({
        username: 'newuser',
        password: 'password123',
        name: 'New',
        surname: 'User'
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/user'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String)
        })
      );
    });

    it('should handle registration errors', async () => {
      const mockResponse = {
        success: false,
        error: 'Username already exists'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 400,
        json: async () => mockResponse
      });

      const result = await authApi.register({
        username: 'existinguser',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists');
    });
  });
});
