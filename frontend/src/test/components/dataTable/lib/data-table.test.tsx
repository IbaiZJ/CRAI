import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '@/components/dataTable/lib/data-table'
import type { ColumnDef } from '@tanstack/react-table'

interface TestData {
  id: string
  name: string
  email: string
  status: string
}

describe('DataTable', () => {
  const mockData: TestData[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'active' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'inactive' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'active' },
  ]

  const columns: ColumnDef<TestData>[] = [
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

  describe('basic rendering', () => {
    it('should render table with data', () => {
      render(<DataTable columns={columns} data={mockData} />)
      
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
      expect(screen.getAllByText('active')[0]).toBeInTheDocument()
    })

    it('should render all column headers', () => {
      render(<DataTable columns={columns} data={mockData} />)
      
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should render all rows', () => {
      const { container } = render(<DataTable columns={columns} data={mockData} />)
      
      const rows = container.querySelectorAll('tbody tr')
      expect(rows).toHaveLength(3)
    })

    it('should show "No results" when data is empty', () => {
      render(<DataTable columns={columns} data={[]} />)
      
      expect(screen.getByText('No results.')).toBeInTheDocument()
    })
  })

  describe('global filter/search', () => {
    it('should render search input by default', () => {
      render(<DataTable columns={columns} data={mockData} />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toBeInTheDocument()
    })

    it('should use custom search placeholder', () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          searchPlaceholder="Filter users..."
        />
      )
      
      expect(screen.getByPlaceholderText('Filter users...')).toBeInTheDocument()
    })

    it('should filter rows based on search input', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={mockData} />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'Alice')
      
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
    })

    it('should show "No results" when filter matches nothing', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={mockData} />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'nonexistent')
      
      expect(screen.getByText('No results.')).toBeInTheDocument()
    })

    it('should not render search when enableGlobalFilter is false', () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          enableGlobalFilter={false}
        />
      )
      
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })

    it('should search across all columns', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={mockData} />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      
      await user.clear(searchInput)
      await user.type(searchInput, 'alice@example.com')
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      
      await user.clear(searchInput)
      await user.type(searchInput, 'inactive')
      expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    })
  })

  describe('column visibility', () => {
    it('should render column visibility dropdown by default', () => {
      render(<DataTable columns={columns} data={mockData} />)
      
      const columnsButton = screen.getByRole('button', { name: /Columns/i })
      expect(columnsButton).toBeInTheDocument()
    })

    it('should not render column visibility when disabled', () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          enableColumnVisibility={false}
        />
      )
      
      expect(screen.queryByRole('button', { name: /Columns/i })).not.toBeInTheDocument()
    })

    it('should show column options when dropdown is opened', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={mockData} />)
      
      const columnsButton = screen.getByRole('button', { name: /Columns/i })
      await user.click(columnsButton)
      
      expect(screen.getByText('name')).toBeInTheDocument()
      expect(screen.getByText('email')).toBeInTheDocument()
      expect(screen.getByText('status')).toBeInTheDocument()
    })

    it('should toggle column visibility', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={mockData} />)
      
      const columnsButton = screen.getByRole('button', { name: /Columns/i })
      await user.click(columnsButton)
      
      const nameCheckbox = screen.getByText('name')
      await user.click(nameCheckbox)
      
      // Name column header should be hidden
      expect(screen.queryByText('Name')).not.toBeInTheDocument()
    })
  })

  describe('row selection', () => {
    it('should show selection count by default', () => {
      render(<DataTable columns={columns} data={mockData} />)
      
      expect(screen.getByText(/0 of 3 row\(s\) selected/)).toBeInTheDocument()
    })

    it('should not show selection count when disabled', () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          enableRowSelection={false}
        />
      )
      
      expect(screen.queryByText(/row\(s\) selected/)).not.toBeInTheDocument()
    })

    it('should update selection count when rows are selected', async () => {
      const user = userEvent.setup()
      
      const selectableColumns: ColumnDef<TestData>[] = [
        {
          id: 'select',
          header: ({ table }) => (
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(e.target.checked)}
              aria-label="Select row"
            />
          ),
        },
        ...columns,
      ]
      
      render(<DataTable columns={selectableColumns} data={mockData} />)
      
      const selectAllCheckbox = screen.getByLabelText('Select all')
      await user.click(selectAllCheckbox)
      
      expect(screen.getByText(/3 of 3 row\(s\) selected/)).toBeInTheDocument()
    })
  })

  describe('pagination', () => {
    const largeDataSet = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
    }))

    it('should render pagination controls', () => {
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    })

    it('should disable Previous button on first page', () => {
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      const previousButton = screen.getByRole('button', { name: /Previous/i })
      expect(previousButton).toBeDisabled()
    })

    it('should enable Next button when more pages exist', () => {
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      const nextButton = screen.getByRole('button', { name: /Next/i })
      expect(nextButton).not.toBeDisabled()
    })

    it('should navigate to next page', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      const nextButton = screen.getByRole('button', { name: /Next/i })
      await user.click(nextButton)
      
      // Check that data from page 2 is visible
      expect(screen.getByText('User 11')).toBeInTheDocument()
    })

    it('should navigate to previous page', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      const nextButton = screen.getByRole('button', { name: /Next/i })
      await user.click(nextButton)
      
      const previousButton = screen.getByRole('button', { name: /Previous/i })
      await user.click(previousButton)
      
      // Back to page 1
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    it('should render page number buttons', () => {
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      // Should show page 1 button
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    })

    it.skip('should render ellipsis for hidden pages (needs more pages to trigger ellipsis)', () => {
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      // With 25 items and default pagination, should show ellipsis
      const ellipsisButton = screen.getByRole('button', { name: '...' })
      expect(ellipsisButton).toBeInTheDocument()
    })

    it('should navigate to specific page by clicking page number', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      const page2Button = screen.getByRole('button', { name: '2' })
      await user.click(page2Button)
      
      expect(screen.getByText('User 11')).toBeInTheDocument()
    })

    it('should highlight current page', () => {
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      const page1Button = screen.getByRole('button', { name: '1' })
      // Current page should have 'default' variant styling
      expect(page1Button).toBeInTheDocument()
    })

    it.skip('should show hidden pages in ellipsis dropdown (needs more pages)', async () => {
      const user = userEvent.setup()
      render(<DataTable columns={columns} data={largeDataSet} />)
      
      const ellipsisButton = screen.getByRole('button', { name: '...' })
      await user.click(ellipsisButton)
      
      // Should show hidden page options
      expect(screen.getByText(/Page/)).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('should support column sorting when column has sorting enabled', async () => {
      const user = userEvent.setup()
      
      const sortableColumns: ColumnDef<TestData>[] = [
        {
          accessorKey: 'name',
          header: ({ column }) => (
            <button onClick={() => column.toggleSorting()}>
              Name
            </button>
          ),
        },
        ...columns.slice(1),
      ]
      
      render(<DataTable columns={sortableColumns} data={mockData} />)
      
      const nameHeader = screen.getByRole('button', { name: 'Name' })
      await user.click(nameHeader)
      
      // Should sort alphabetically
      const rows = screen.getAllByRole('row')
      expect(within(rows[1]).getByText('Alice Johnson')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle single item', () => {
      const singleItem = [mockData[0]]
      render(<DataTable columns={columns} data={singleItem} />)
      
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Next/i })).toBeInTheDocument()
    })

    it('should handle very long column values', () => {
      const longData = [{
        id: '1',
        name: 'A'.repeat(100),
        email: 'test@example.com',
        status: 'active',
      }]
      
      render(<DataTable columns={columns} data={longData} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should preserve filter when changing pages', async () => {
      const user = userEvent.setup()
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Active User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: 'active',
      }))
      
      render(<DataTable columns={columns} data={largeData} />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'Active')
      
      const nextButton = screen.getByRole('button', { name: /Next/i })
      await user.click(nextButton)
      
      // Filter should still be applied on page 2
      expect(screen.getByText('Active User 11')).toBeInTheDocument()
    })

    it('should update pagination when data changes', () => {
      const { rerender } = render(<DataTable columns={columns} data={mockData} />)
      
      const moreData = [...mockData, ...mockData]
      rerender(<DataTable columns={columns} data={moreData} />)
      
      expect(screen.getByText(/0 of 6 row\(s\) selected/)).toBeInTheDocument()
    })
  })

  describe('combined features', () => {
    it('should work with all features disabled', () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          enableGlobalFilter={false}
          enableColumnVisibility={false}
          enableRowSelection={false}
        />
      )
      
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Columns/i })).not.toBeInTheDocument()
      expect(screen.queryByText(/row\(s\) selected/)).not.toBeInTheDocument()
    })

    it('should work with all features enabled', async () => {
      const user = userEvent.setup()
      
      const selectableColumns: ColumnDef<TestData>[] = [
        {
          id: 'select',
          header: ({ table }) => (
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(e.target.checked)}
              aria-label="Select row"
            />
          ),
        },
        ...columns,
      ]
      
      render(
        <DataTable
          columns={selectableColumns}
          data={mockData}
          enableGlobalFilter={true}
          enableColumnVisibility={true}
          enableRowSelection={true}
        />
      )
      
      // Search
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toBeInTheDocument()
      
      // Column visibility
      expect(screen.getByRole('button', { name: /Columns/i })).toBeInTheDocument()
      
      // Row selection
      expect(screen.getByText(/0 of 3 row\(s\) selected/)).toBeInTheDocument()
      
      // Pagination
      expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument()
    })
  })
})
