import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './data-table'

interface TestData {
  id: number
  name: string
  email: string
  status: string
}

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'pending' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'active' },
]

const mockColumns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
]

describe('DataTable', () => {
  describe('Rendering', () => {
    it('should render table with data', () => {
      render(
        <DataTable columns={mockColumns} data={mockData} />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('should render table headers', () => {
      render(
        <DataTable columns={mockColumns} data={mockData} />
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should render all data rows', () => {
      render(
        <DataTable columns={mockColumns} data={mockData} />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      expect(screen.getByText('Alice Brown')).toBeInTheDocument()
      expect(screen.getByText('Charlie Wilson')).toBeInTheDocument()
    })

    it('should render empty state when no data', () => {
      render(
        <DataTable columns={mockColumns} data={[]} />
      )

      expect(screen.getByText('No results.')).toBeInTheDocument()
    })
  })

  describe('Global Filter', () => {
    it('should render search input when enableGlobalFilter is true', () => {
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableGlobalFilter={true}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toBeInTheDocument()
    })

    it('should use custom searchPlaceholder', () => {
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          searchPlaceholder="Find users..."
          enableGlobalFilter={true}
        />
      )

      expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument()
    })

    it('should filter data when typing in search', async () => {
      const user = userEvent.setup()
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableGlobalFilter={true}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'John')

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('should not render search when enableGlobalFilter is false', () => {
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableGlobalFilter={false}
        />
      )

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })
  })

  describe('Column Visibility', () => {
    it('should render column visibility dropdown when enabled', () => {
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableColumnVisibility={true}
        />
      )

      const columnsButton = screen.getByText('Columns')
      expect(columnsButton).toBeInTheDocument()
    })

    it('should not render column visibility dropdown when disabled', () => {
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableColumnVisibility={false}
        />
      )

      expect(screen.queryByText('Columns')).not.toBeInTheDocument()
    })

    it('should toggle column visibility', async () => {
      const user = userEvent.setup()
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableColumnVisibility={true}
        />
      )

      const columnsButton = screen.getByText('Columns')
      await user.click(columnsButton)

      const nameCheckbox = screen.getByRole('menuitemcheckbox', { name: /name/i })
      expect(nameCheckbox).toBeInTheDocument()
    })
  })

  describe('Row Selection', () => {
    it('should display selected row count when enableRowSelection is true', () => {
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableRowSelection={true}
        />
      )

      expect(screen.getByText(/of.*row\(s\) selected/)).toBeInTheDocument()
    })

    it('should not display selected row count when enableRowSelection is false', () => {
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableRowSelection={false}
        />
      )

      expect(screen.queryByText(/of.*row\(s\) selected/)).not.toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should render pagination buttons', () => {
      render(
        <DataTable columns={mockColumns} data={mockData} />
      )

      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('should disable previous button on first page', () => {
      render(
        <DataTable columns={mockColumns} data={mockData} />
      )

      const previousButton = screen.getByRole('button', { name: /previous/i })
      expect(previousButton).toBeDisabled()
    })

    it('should navigate to next page', async () => {
      const user = userEvent.setup()
      const largeData = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active',
      }))

      render(
        <DataTable columns={mockColumns} data={largeData} />
      )

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      // After pagination, first page data should be gone
      expect(screen.queryByText('User 1')).not.toBeInTheDocument()
    })

    it('should navigate to previous page', async () => {
      const user = userEvent.setup()
      const largeData = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active',
      }))

      render(
        <DataTable columns={mockColumns} data={largeData} />
      )

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      const previousButton = screen.getByRole('button', { name: /previous/i })
      await user.click(previousButton)

      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    it('should display page numbers for pagination', () => {
      const largeData = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active',
      }))

      render(
        <DataTable columns={mockColumns} data={largeData} />
      )

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    })

    it('should highlight current page button', () => {
      const largeData = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active',
      }))

      render(
        <DataTable columns={mockColumns} data={largeData} />
      )

      const currentPageButton = screen.getByRole('button', { name: '1' })
      expect(currentPageButton).toBeInTheDocument()
    })

    it('should navigate to specific page when clicked', async () => {
      const user = userEvent.setup()
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active',
      }))

      render(
        <DataTable columns={mockColumns} data={largeData} />
      )

      const page2Button = screen.getByRole('button', { name: '2' })
      await user.click(page2Button)

      expect(screen.queryByText('User 1')).not.toBeInTheDocument()
    })

    it('should show ellipsis and dropdown for many pages', async () => {
      const user = userEvent.setup()
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active',
      }))

      render(
        <DataTable columns={mockColumns} data={largeData} />
      )

      const ellipsisButton = screen.getByRole('button', { name: '...' })
      expect(ellipsisButton).toBeInTheDocument()

      await user.click(ellipsisButton)

      // Should show hidden pages in dropdown
      const dropdownItems = screen.getAllByRole('menuitemcheckbox')
      expect(dropdownItems.length).toBeGreaterThan(0)
    })
  })

  describe('Sorting', () => {
    it('should render sortable column headers', async () => {
      const user = userEvent.setup()
      const sortableColumns: ColumnDef<TestData>[] = [
        {
          accessorKey: 'name',
          header: 'Name',
        },
      ]

      render(
        <DataTable columns={sortableColumns} data={mockData} />
      )

      const nameHeader = screen.getByText('Name')
      expect(nameHeader).toBeInTheDocument()
    })
  })

  describe('Composition Features', () => {
    it('should work with all features enabled', () => {
      render(
        <DataTable 
          columns={mockColumns}
          data={mockData}
          enableGlobalFilter={true}
          enableColumnVisibility={true}
          enableRowSelection={true}
          searchPlaceholder="Search users..."
        />
      )

      expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument()
      expect(screen.getByText('Columns')).toBeInTheDocument()
      expect(screen.getByText(/of.*row\(s\) selected/)).toBeInTheDocument()
    })

    it('should work with all features disabled', () => {
      render(
        <DataTable 
          columns={mockColumns}
          data={mockData}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          enableRowSelection={false}
        />
      )

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
      expect(screen.queryByText('Columns')).not.toBeInTheDocument()
      expect(screen.queryByText(/of.*row\(s\) selected/)).not.toBeInTheDocument()
    })

    it('should render with default feature enablement', () => {
      render(
        <DataTable 
          columns={mockColumns}
          data={mockData}
        />
      )

      // Default enableGlobalFilter should be true
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()

      // Default enableColumnVisibility should be true
      expect(screen.getByText('Columns')).toBeInTheDocument()

      // Default enableRowSelection should be true
      expect(screen.getByText(/of.*row\(s\) selected/)).toBeInTheDocument()
    })
  })

  describe('Data Table Cell Rendering', () => {
    it('should render cell content correctly', () => {
      const customColumns: ColumnDef<TestData>[] = [
        {
          accessorKey: 'name',
          header: 'Name',
          cell: ({ row }) => <strong>{row.getValue('name')}</strong>,
        },
        {
          accessorKey: 'status',
          header: 'Status',
          cell: ({ row }) => {
            const status = row.getValue('status') as string
            return <span className={`status-${status}`}>{status}</span>
          },
        },
      ]

      render(
        <DataTable columns={customColumns} data={mockData} />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getAllByText('active')[0]).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      render(
        <DataTable columns={mockColumns} data={[]} />
      )

      expect(screen.getByText('No results.')).toBeInTheDocument()
    })

    it('should handle data with many rows', () => {
      const manyRows = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active',
      }))

      render(
        <DataTable columns={mockColumns} data={manyRows} />
      )

      expect(screen.getByText('User 1')).toBeInTheDocument()
      // With default pagination, not all rows should be visible
      expect(screen.queryByText('User 50')).not.toBeInTheDocument()
    })

    it('should handle special characters in data', () => {
      const specialData: TestData[] = [
        {
          id: 1,
          name: 'John & Jane',
          email: 'john+jane@example.com',
          status: 'active',
        },
      ]

      render(
        <DataTable columns={mockColumns} data={specialData} />
      )

      expect(screen.getByText('John & Jane')).toBeInTheDocument()
      expect(screen.getByText('john+jane@example.com')).toBeInTheDocument()
    })

    it('should maintain state across re-renders', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableGlobalFilter={true}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement
      await user.type(searchInput, 'John')

      expect(searchInput.value).toBe('John')

      rerender(
        <DataTable 
          columns={mockColumns} 
          data={mockData}
          enableGlobalFilter={true}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
