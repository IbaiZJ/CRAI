import { describe, it, expect, vi } from 'vitest';
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
    it('renders table with container', () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const container = document.querySelector('[data-slot="table-container"]');
      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const table = document.querySelector('[data-slot="table"]');
      expect(table).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const table = document.querySelector('[data-slot="table"]');
      expect(table).toHaveClass('custom-table');
    });

    it('has table role', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('TableHeader', () => {
    it('renders thead element', () => {
      render(
        <Table>
          <TableHeader data-testid="header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      
      expect(screen.getByTestId('header').tagName).toBe('THEAD');
    });

    it('has correct data-slot attribute', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      
      const header = document.querySelector('[data-slot="table-header"]');
      expect(header).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableHeader className="custom-header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      
      const header = document.querySelector('[data-slot="table-header"]');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('TableBody', () => {
    it('renders tbody element', () => {
      render(
        <Table>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      expect(screen.getByTestId('body').tagName).toBe('TBODY');
    });

    it('has correct data-slot attribute', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const body = document.querySelector('[data-slot="table-body"]');
      expect(body).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody className="custom-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const body = document.querySelector('[data-slot="table-body"]');
      expect(body).toHaveClass('custom-body');
    });
  });

  describe('TableFooter', () => {
    it('renders tfoot element', () => {
      render(
        <Table>
          <TableFooter data-testid="footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      
      expect(screen.getByTestId('footer').tagName).toBe('TFOOT');
    });

    it('has correct data-slot attribute', () => {
      render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      
      const footer = document.querySelector('[data-slot="table-footer"]');
      expect(footer).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableFooter className="custom-footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      
      const footer = document.querySelector('[data-slot="table-footer"]');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('TableRow', () => {
    it('renders tr element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      expect(screen.getByTestId('row').tagName).toBe('TR');
    });

    it('has correct data-slot attribute', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const row = document.querySelector('[data-slot="table-row"]');
      expect(row).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow className="custom-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const row = document.querySelector('[data-slot="table-row"]');
      expect(row).toHaveClass('custom-row');
    });
  });

  describe('TableHead', () => {
    it('renders th element', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      
      expect(screen.getByTestId('head').tagName).toBe('TH');
    });

    it('has correct data-slot attribute', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      
      const head = document.querySelector('[data-slot="table-head"]');
      expect(head).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="custom-head">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      
      const head = document.querySelector('[data-slot="table-head"]');
      expect(head).toHaveClass('custom-head');
    });
  });

  describe('TableCell', () => {
    it('renders td element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      expect(screen.getByTestId('cell').tagName).toBe('TD');
    });

    it('has correct data-slot attribute', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const cell = document.querySelector('[data-slot="table-cell"]');
      expect(cell).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="custom-cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const cell = document.querySelector('[data-slot="table-cell"]');
      expect(cell).toHaveClass('custom-cell');
    });
  });

  describe('TableCaption', () => {
    it('renders caption element', () => {
      render(
        <Table>
          <TableCaption data-testid="caption">Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      expect(screen.getByTestId('caption').tagName).toBe('CAPTION');
    });

    it('has correct data-slot attribute', () => {
      render(
        <Table>
          <TableCaption>Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const caption = document.querySelector('[data-slot="table-caption"]');
      expect(caption).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableCaption className="custom-caption">Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      const caption = document.querySelector('[data-slot="table-caption"]');
      expect(caption).toHaveClass('custom-caption');
    });

    it('renders caption text', () => {
      render(
        <Table>
          <TableCaption>Table caption text</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      expect(screen.getByText('Table caption text')).toBeInTheDocument();
    });
  });

  describe('Complete Table', () => {
    it('renders a complete table with all components', () => {
      render(
        <Table>
          <TableCaption>A sample table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
              <TableCell>30</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane</TableCell>
              <TableCell>25</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>2</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      
      expect(screen.getByText('A sample table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });
});
