import { render } from '@testing-library/react';
import ChartBarStacked from '../../../components/charts/barCharts/chart-bar-stacked';
describe('Smoke test ChartBarStacked', () => {
  it('renders ChartBarStacked', () => {
    render(<ChartBarStacked data={[]} />);
  });
});
