import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

describe('Table Components', () => {
  describe('Table', () => {
    it('renders a table element wrapped in a container', () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByTestId('table');
      expect(table.tagName).toBe('TABLE');
      expect(table).toHaveAttribute('data-slot', 'table');
      expect(table).toHaveAttribute('role', 'table');
    });

    it('renders container with data-slot', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(container.querySelector('[data-slot="table-container"]')).toBeInTheDocument();
    });

    it('applies custom className to table', () => {
      render(
        <Table data-testid="table" className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('table')).toHaveClass('custom-table');
    });
  });

  describe('TableHeader', () => {
    it('renders a thead element', () => {
      render(
        <Table>
          <TableHeader data-testid="header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const header = screen.getByTestId('header');
      expect(header.tagName).toBe('THEAD');
      expect(header).toHaveAttribute('data-slot', 'table-header');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableHeader data-testid="header" className="custom-header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('header')).toHaveClass('custom-header');
    });
  });

  describe('TableBody', () => {
    it('renders a tbody element', () => {
      render(
        <Table>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const body = screen.getByTestId('body');
      expect(body.tagName).toBe('TBODY');
      expect(body).toHaveAttribute('data-slot', 'table-body');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody data-testid="body" className="custom-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('body')).toHaveClass('custom-body');
    });
  });

  describe('TableFooter', () => {
    it('renders a tfoot element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter data-testid="footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      const footer = screen.getByTestId('footer');
      expect(footer.tagName).toBe('TFOOT');
      expect(footer).toHaveAttribute('data-slot', 'table-footer');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter data-testid="footer" className="custom-footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
    });
  });

  describe('TableRow', () => {
    it('renders a tr element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = screen.getByTestId('row');
      expect(row.tagName).toBe('TR');
      expect(row).toHaveAttribute('data-slot', 'table-row');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row" className="custom-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('row')).toHaveClass('custom-row');
    });
  });

  describe('TableHead', () => {
    it('renders a th element', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const head = screen.getByTestId('head');
      expect(head.tagName).toBe('TH');
      expect(head).toHaveAttribute('data-slot', 'table-head');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head" className="custom-head">Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('head')).toHaveClass('custom-head');
    });
  });

  describe('TableCell', () => {
    it('renders a td element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = screen.getByTestId('cell');
      expect(cell.tagName).toBe('TD');
      expect(cell).toHaveAttribute('data-slot', 'table-cell');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell" className="custom-cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('cell')).toHaveClass('custom-cell');
    });
  });

  describe('TableCaption', () => {
    it('renders a caption element', () => {
      render(
        <Table>
          <TableCaption data-testid="caption">Table Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const caption = screen.getByTestId('caption');
      expect(caption.tagName).toBe('CAPTION');
      expect(caption).toHaveAttribute('data-slot', 'table-caption');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableCaption data-testid="caption" className="custom-caption">Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('caption')).toHaveClass('custom-caption');
    });
  });

  describe('Table Integration', () => {
    it('renders a complete table with all components', () => {
      render(
        <Table>
          <TableCaption>Monthly Sales</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>January</TableCell>
              <TableCell>$1,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>February</TableCell>
              <TableCell>$1,200</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>$2,200</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('Monthly Sales')).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('January')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('$2,200')).toBeInTheDocument();
    });
  });
});
