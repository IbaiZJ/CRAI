import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

describe('Home Component', () => {
  it('renders home page successfully', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Verifica que el componente se renderiza y tiene contenido
    expect(container).toBeTruthy();
    expect(container.textContent).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Verifica que el div principal existe
    expect(container.firstChild).toBeTruthy();
  });
});
