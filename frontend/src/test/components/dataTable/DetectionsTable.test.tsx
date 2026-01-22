import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetectionsTable, { type Detection } from '@/components/dataTable/DetectionsTable';

// Mock the DataTable component
vi.mock('@/components/dataTable/lib/data-table', () => ({
  DataTable: ({ columns, data, searchPlaceholder }: any) => (
    <div data-testid="data-table">
      <input placeholder={searchPlaceholder} data-testid="search-input" />
      <table>
        <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.accessorKey}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, index: number) => (
            <tr key={index} data-testid="table-row">
              {columns.map((col: any) => (
                <td key={col.accessorKey}>
                  {col.cell ? col.cell(row[col.accessorKey]) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

// Mock createColumns
vi.mock('@/components/dataTable/lib/createColumns', () => ({
  createColumns: ({ columns }: any) => columns,
}));

describe('DetectionsTable', () => {
  const mockDetections: Detection[] = [
    {
      id: 1,
      vehicleId: 'ABC123',
      cameraId: 1,
      detectionDate: '2024-01-15T10:30:00Z',
      itvStatus: 'valid',
    },
    {
      id: 2,
      vehicleId: 'XYZ789',
      cameraId: 2,
      detectionDate: '2024-01-15T11:45:00Z',
      itvStatus: 'expired',
    },
    {
      id: 3,
      vehicleId: 'DEF456',
      cameraId: 3,
      detectionDate: '2024-01-15T14:20:00Z',
      itvStatus: 'expiring_soon',
    },
  ];

  describe('Rendering', () => {
    it('renders the data table', () => {
      render(<DetectionsTable data={mockDetections} />);
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    it('renders search input with correct placeholder', () => {
      render(<DetectionsTable data={mockDetections} />);
      expect(screen.getByPlaceholderText('Filter detections...')).toBeInTheDocument();
    });

    it('renders table headers', () => {
      render(<DetectionsTable data={mockDetections} />);
      expect(screen.getByText('Detection Date')).toBeInTheDocument();
      expect(screen.getByText('License Plate')).toBeInTheDocument();
      expect(screen.getByText('Camera')).toBeInTheDocument();
      expect(screen.getByText('ITV Status')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      render(<DetectionsTable data={mockDetections} />);
      const rows = screen.getAllByTestId('table-row');
      expect(rows).toHaveLength(3);
    });
  });

  describe('Empty State', () => {
    it('renders with empty data array', () => {
      render(<DetectionsTable data={[]} />);
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      expect(screen.queryByTestId('table-row')).not.toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays vehicle IDs', () => {
      render(<DetectionsTable data={mockDetections} />);
      expect(screen.getByText('ABC123')).toBeInTheDocument();
      expect(screen.getByText('XYZ789')).toBeInTheDocument();
      expect(screen.getByText('DEF456')).toBeInTheDocument();
    });

    it('displays camera IDs', () => {
      render(<DetectionsTable data={mockDetections} />);
      expect(screen.getByText('Cam #1')).toBeInTheDocument();
      expect(screen.getByText('Cam #2')).toBeInTheDocument();
      expect(screen.getByText('Cam #3')).toBeInTheDocument();
    });
  });

  describe('ITV Status Badges', () => {
    it('displays valid status badge', () => {
      render(<DetectionsTable data={[mockDetections[0]]} />);
      expect(screen.getByText('Valid ITV')).toBeInTheDocument();
    });

    it('displays expired status badge', () => {
      render(<DetectionsTable data={[mockDetections[1]]} />);
      expect(screen.getByText('ITV EXPIRED')).toBeInTheDocument();
    });

    it('displays expiring soon status badge', () => {
      render(<DetectionsTable data={[mockDetections[2]]} />);
      expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly', () => {
      render(<DetectionsTable data={mockDetections} />);
      // The date format is "dd/MM/yyyy HH:mm"
      expect(screen.getByText('15/01/2024 10:30')).toBeInTheDocument();
    });

    it('handles invalid dates gracefully', () => {
      const dataWithInvalidDate: Detection[] = [
        {
          id: 1,
          vehicleId: 'ABC123',
          cameraId: 1,
          detectionDate: 'invalid-date',
          itvStatus: 'valid',
        },
      ];
      render(<DetectionsTable data={dataWithInvalidDate} />);
      // Should not throw and should display the original string
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });

  describe('Single Detection', () => {
    it('renders single detection correctly', () => {
      const singleDetection: Detection[] = [
        {
          id: 1,
          vehicleId: 'SINGLE123',
          cameraId: 5,
          detectionDate: '2024-06-20T15:00:00Z',
          itvStatus: 'valid',
        },
      ];
      render(<DetectionsTable data={singleDetection} />);
      expect(screen.getByText('SINGLE123')).toBeInTheDocument();
      expect(screen.getByText('Cam #5')).toBeInTheDocument();
    });
  });

  describe('Unknown Status', () => {
    it('handles unknown status gracefully', () => {
      const dataWithUnknownStatus = [
        {
          id: 1,
          vehicleId: 'ABC123',
          cameraId: 1,
          detectionDate: '2024-01-15T10:30:00Z',
          itvStatus: 'unknown' as Detection['itvStatus'],
        },
      ];
      render(<DetectionsTable data={dataWithUnknownStatus} />);
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });
});
