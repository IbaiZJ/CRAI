import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Verifica que el componente se renderice
    expect(container).toBeTruthy();
  });

  it('renders app structure', () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Verifica que el contenedor tenga contenido
    expect(container.firstChild).toBeTruthy();
  });
});
