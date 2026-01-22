import { render } from '@testing-library/react';
import UsersTable from '../../../components/dataTable/UsersTable';
describe('Smoke test UsersTable', () => {
  it('renders UsersTable', () => {
    render(<UsersTable data={[]} onEdit={() => {}} onDelete={() => {}} />);
  });
});
