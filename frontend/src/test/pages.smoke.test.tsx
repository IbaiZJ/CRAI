import { render } from '@testing-library/react';
import Cameras from '../pages/Cameras';
import Cars from '../pages/Cars';
import Dashboard from '../pages/Dashboard';
import Statistics from '../pages/Statistics';
import Users from '../pages/Users';
import Login from '../pages/Login';

describe('Smoke test pages', () => {
  it('renders Cameras', () => {
    render(<Cameras />);
  });
  it('renders Cars', () => {
    render(<Cars />);
  });
  it('renders Dashboard', () => {
    render(<Dashboard />);
  });
  it('renders Statistics', () => {
    render(<Statistics />);
  });
  it('renders Users', () => {
    render(<Users />);
  });
  it('renders Login', () => {
    render(<Login />);
  });
});
