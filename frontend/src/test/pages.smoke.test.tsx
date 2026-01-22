import { render } from '@testing-library/react';
import Cameras from '../pages/Cameras';
import Cars from '../pages/Cars';
import Dashboard from '../pages/Dashboard';
import Statistics from '../pages/Statistics';
import Users from '../pages/Users';
import Login from '../pages/Login';
import { withProviders } from './utils';

describe('Smoke test pages', () => {
  it('renders Cameras', () => {
    render(withProviders(<Cameras />));
  });
  it('renders Cars', () => {
    render(withProviders(<Cars />));
  });
  it('renders Dashboard', () => {
    render(withProviders(<Dashboard />));
  });
  it('renders Statistics', () => {
    render(withProviders(<Statistics />));
  });
  it('renders Users', () => {
    render(withProviders(<Users />));
  });
  it('renders Login', () => {
    render(withProviders(<Login />));
  });
});
