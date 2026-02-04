import { renderWithProviders } from './utils';
import Cameras from '../pages/Cameras';
import Cars from '../pages/Cars';
import Dashboard from '../pages/Dashboard';
import Statistics from '../pages/Statistics';
import Users from '../pages/Users';
import Login from '../pages/Login';

describe('Smoke test pages', () => {
  it('renders Cameras', () => {
    renderWithProviders(<Cameras />);
  });
  it('renders Cars', () => {
    renderWithProviders(<Cars />);
  });
  it('renders Dashboard', () => {
    renderWithProviders(<Dashboard />);
  });
  it('renders Statistics', () => {
    renderWithProviders(<Statistics />);
  });
  it('renders Users', () => {
    renderWithProviders(<Users />);
  });
  it('renders Login', () => {
    renderWithProviders(<Login />);
  });
});
