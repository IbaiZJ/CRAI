import { render } from '@testing-library/react';
import DetectionsTable from '../../../components/dataTable/DetectionsTable';
describe('Smoke test DetectionsTable', () => {
  it('renders DetectionsTable', () => {
    render(<DetectionsTable data={[]} />);
  });
});
