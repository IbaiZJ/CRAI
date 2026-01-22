import { render } from '@testing-library/react';
import CountUp from '../../components/CountUp';
describe('Smoke test CountUp', () => {
  it('renders CountUp', () => {
    render(<CountUp end={10} />);
  });
});
