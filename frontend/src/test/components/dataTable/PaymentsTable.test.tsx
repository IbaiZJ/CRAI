import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaymentsTable from '@/components/dataTable/PaymentsTable';
import { Payment } from '@/constants/paymentConstant';

describe('PaymentsTable', () => {
  const mockData: Payment[] = [
    {
      id: '1',
      amount: 100,
      status: 'success',
      email: 'test@example.com',
      name: 'Test User',
      date: '2024-01-01'
    }
  ];

  it('should render payment data', () => {
    render(<PaymentsTable data={mockData} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
    // Check for formatted currency (might vary by locale, but usually contains the number)
    expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
  });
});
