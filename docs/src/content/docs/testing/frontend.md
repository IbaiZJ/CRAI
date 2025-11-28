---
title: Frontend Tests
description: Frontend testing with Vitest and React Testing Library
---

The CRAI frontend uses Vitest 4 and React Testing Library 16 for comprehensive testing of React components, pages, and user interactions.

## Testing Stack

### Core Technologies

- **Vitest 4.0.14**: Fast unit testing framework built on Vite
- **@testing-library/react 16.3.0**: User-centric React component testing
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions
- **jsdom 27.2.0**: DOM implementation for Node.js
- **happy-dom**: Alternative DOM implementation (available)

## Test Configuration

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

**Key Configuration:**
- `globals: true` - Enables global test APIs (describe, it, expect)
- `environment: 'jsdom'` - Simulates browser DOM
- `setupFiles` - Runs before each test file
- `css: true` - Processes CSS imports

### Test Setup File

**File:** `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
```

This imports custom matchers like:
- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toBeVisible()`
- `toBeDisabled()`

## Running Tests

### NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Command Line

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test -- --run

# Run with UI interface
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test Login.test.tsx

# Run tests matching pattern
npm run test -- --grep="renders"
```

### Docker

```bash
# Run tests in container
docker-compose exec frontend npm run test -- --run

# With coverage
docker-compose exec frontend npm run test:coverage
```

## Test Examples

### Current Test Suite

**6 passing tests:**

1. **Login.test.tsx** (4 tests)
   - renders the login title
   - renders email and password inputs
   - renders the login button and Google sign-in button
   - renders the sign-up link

2. **App.test.tsx** (2 tests)
   - renders without crashing
   - renders the app structure

### Login Page Tests

**File:** `src/test/Login.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

describe('Login Component', () => {
  it('renders the login title', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const titleElement = screen.getByText(/welcome to crai/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('renders the login button and Google sign-in button', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const loginButton = screen.getByRole('button', { name: /log in/i });
    const googleButton = screen.getByRole('button', { name: /google/i });
    
    expect(loginButton).toBeInTheDocument();
    expect(googleButton).toBeInTheDocument();
  });

  it('renders the sign-up link', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const signUpLink = screen.getByText(/don't have an account/i);
    expect(signUpLink).toBeInTheDocument();
  });
});
```

### App Component Tests

**File:** `src/test/App.test.tsx`

```tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  it('renders the app structure', () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });
});
```

## Testing Patterns

### Component with Router

Components using React Router need `<BrowserRouter>` wrapper:

```tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from './MyComponent';

test('renders component with router', () => {
  render(
    <BrowserRouter>
      <MyComponent />
    </BrowserRouter>
  );
});
```

### User Interactions

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

test('handles form submission', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  
  render(<LoginForm onSubmit={onSubmit} />);
  
  // Type in inputs
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  
  // Click button
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});
```

### Async Operations

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import DataComponent from './DataComponent';

test('loads and displays data', async () => {
  render(<DataComponent />);
  
  // Initially shows loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
  });
});
```

### Firebase Auth Mocking

```tsx
import { vi } from 'vitest';

// Mock Firebase
vi.mock('@/database/config/firebase', () => ({
  auth: {
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  }
}));

test('handles login', async () => {
  const { signInWithEmailAndPassword } = await import('@/database/config/firebase');
  
  signInWithEmailAndPassword.mockResolvedValue({
    user: { uid: '123', email: 'test@example.com' }
  });
  
  // Test login flow
});
```

## Coverage

### Running Coverage

```bash
npm run test:coverage
```

### Coverage Report

Generated in `htmlcov/` directory:

```
htmlcov/
├── index.html              # Coverage summary
├── style.css              # Styles
├── coverage_html.js       # Interactive features
└── *.html                 # Per-file coverage
```

Open `htmlcov/index.html` in browser to view interactive report.

### Coverage Thresholds

**Goal:** Maintain >80% coverage

Current coverage by file:
- Login.tsx: Well covered (4 tests)
- App.tsx: Basic coverage (2 tests)
- Other components: To be added

## Writing New Tests

### Test File Structure

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('does something', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Best Practices

1. **Test User Behavior, Not Implementation**
   ```tsx
   // Good: Test what user sees
   expect(screen.getByText(/login/i)).toBeInTheDocument();
   
   // Bad: Test implementation details
   expect(component.state.isLoggedIn).toBe(false);
   ```

2. **Use Accessible Queries**
   ```tsx
   // Good: Accessible queries
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText(/email/i)
   
   // Avoid: Implementation-specific queries
   screen.getByClassName('submit-button')
   ```

3. **Clean Up After Tests**
   ```tsx
   afterEach(() => {
     vi.clearAllMocks();
   });
   ```

4. **Test Error States**
   ```tsx
   test('shows error message on failed login', async () => {
     // Mock API failure
     // Trigger login
     // Assert error message displayed
   });
   ```

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to `main` branch
- Pull requests
- Changes in `frontend/` directory

**Workflow:** `.github/workflows/frontend-ci.yml`

```yaml
- name: Run tests
  run: npm run test -- --run
```

## Troubleshooting

### Common Issues

**1. "Cannot find module @testing-library/react"**
```bash
npm install --save-dev @testing-library/react
```

**2. "toBeInTheDocument is not a function"**
Ensure `@testing-library/jest-dom` is imported in `setup.ts`.

**3. "Router not found" errors**
Wrap component in `<BrowserRouter>` in tests.

**4. Tests hang indefinitely**
Use `--run` flag to disable watch mode:
```bash
npm run test -- --run
```

## Next Steps

- Add more component tests (target: 20+ tests)
- Implement E2E tests with Playwright
- Add API mocking with MSW
- Test protected routes and auth flows
- Increase coverage to >90%

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- See [CI/CD Pipeline](/testing/ci-cd/) for automation
- Review [Testing Overview](/testing/overview/) for strategy
