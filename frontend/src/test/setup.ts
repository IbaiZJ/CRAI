import '@testing-library/jest-dom';
import { vi } from 'vitest';
import type React from 'react';

// Mock global fetch with default responses
globalThis.fetch = vi.fn((url) => {
  // Default mock - can be overridden in individual tests
  console.log('Mock fetch called with:', url);
  
  if (typeof url === 'string') {
    if (url.includes('/cameras')) {
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    }
    if (url.includes('/user')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        }),
      });
    }
    if (url.includes('/vehicles')) {
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    }
  }
  
  // Default fallback
  return Promise.resolve({
    ok: true,
    json: async () => [],
  });
}) as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the entire Firebase config module to prevent initialization
vi.mock('../database/config/firebase', () => ({
  app: {},
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  db: {},
  storage: {},
  default: {},
}));

// Mock Firebase modules to prevent initialization errors in tests
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  })),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
}));

// Mock jwt-decode - will decode valid JWT structure
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token: string) => {
    // Simple base64 decode simulation
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }),
}));

// Mock Google OAuth
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => children,
  GoogleLogin: vi.fn(() => null),
  useGoogleLogin: vi.fn(() => vi.fn()),
}));

// Mock IntersectionObserver for framer-motion
if (typeof globalThis !== 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as any;
}
