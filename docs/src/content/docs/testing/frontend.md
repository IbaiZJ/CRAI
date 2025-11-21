---
title: Frontend Tests
description: Frontend testing strategy
---

Frontend testing guide for CRAI React application (to be implemented).

## Planned Testing Stack

- **Vitest**: Unit and component testing
- **Testing Library**: React component testing
- **Playwright**: E2E testing
- **MSW**: API mocking

## Component Testing

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## API Mocking

```tsx
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/hello', (req, res, ctx) => {
    return res(ctx.json({ message: 'Hello World' }))
  })
)
```

## Next Steps

- Implementation in progress
- See [Testing Overview](/testing/overview/)
