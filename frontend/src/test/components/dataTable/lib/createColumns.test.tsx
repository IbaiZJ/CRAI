import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createColumns, type TableConfig } from '@/components/dataTable/lib/createColumns'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

// Test component to render the table
function TestTable({ config, data }: { config: TableConfig<any>, data: any[] }) {
  const columns = createColumns(config)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface TestData {
  id: string
  name: string
  email: string
  status: string
}

describe('createColumns', () => {
  const testData: TestData[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  ]

  describe('basic columns', () => {
    it('should create basic columns without selection or actions', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email' },
        ],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(2)
      expect((columns[0] as any).accessorKey).toBe('name')
      expect((columns[1] as any).accessorKey).toBe('email')
    })

    it('should render column headers correctly', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email' },
        ],
      }

      render(<TestTable config={config} data={testData} />)
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should render cell data correctly', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email' },
        ],
      }

      render(<TestTable config={config} data={testData} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  describe('selection column', () => {
    it('should add selection column when enableSelection is true', () => {
      const config: TableConfig<TestData> = {
        enableSelection: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(2)
      expect(columns[0].id).toBe('select')
    })

    it('should render select all checkbox', () => {
      const config: TableConfig<TestData> = {
        enableSelection: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      render(<TestTable config={config} data={testData} />)
      const selectAllCheckbox = screen.getByLabelText('Select all')
      expect(selectAllCheckbox).toBeInTheDocument()
    })

    it('should render row selection checkboxes', () => {
      const config: TableConfig<TestData> = {
        enableSelection: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      render(<TestTable config={config} data={testData} />)
      const rowCheckboxes = screen.getAllByLabelText('Select row')
      expect(rowCheckboxes).toHaveLength(2)
    })

    it('should not add selection column when enableSelection is false', () => {
      const config: TableConfig<TestData> = {
        enableSelection: false,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(1)
      expect(columns[0].id).not.toBe('select')
    })
  })

  describe('sorting', () => {
    it('should enable sorting by default', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      render(<TestTable config={config} data={testData} />)
      const sortButton = screen.getByRole('button', { name: /Name/i })
      expect(sortButton).toBeInTheDocument()
    })

    it('should disable sorting when enableSorting is false', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name', enableSorting: false },
        ],
      }

      render(<TestTable config={config} data={testData} />)
      expect(screen.queryByRole('button', { name: /Name/i })).not.toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('should render sort icon in header when sorting is enabled', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      const { container } = render(<TestTable config={config} data={testData} />)
      const sortIcon = container.querySelector('.lucide-arrow-up-down')
      expect(sortIcon).toBeInTheDocument()
    })
  })

  describe('custom cell renderer', () => {
    it('should use custom cell renderer when provided', () => {
      const config: TableConfig<TestData> = {
        columns: [
          {
            accessorKey: 'name',
            header: 'Name',
            cell: (value) => <span data-testid="custom-cell">{value.toUpperCase()}</span>,
          },
        ],
      }

      render(<TestTable config={config} data={testData} />)
      expect(screen.getByText('JOHN DOE')).toBeInTheDocument()
      expect(screen.getAllByTestId('custom-cell')[0]).toBeInTheDocument()
    })

    it('should pass row data to custom cell renderer', () => {
      const config: TableConfig<TestData> = {
        columns: [
          {
            accessorKey: 'name',
            header: 'Name',
            cell: (value, row) => (
              <span data-testid="custom-cell">
                {value} - {row.status}
              </span>
            ),
          },
        ],
      }

      render(<TestTable config={config} data={testData} />)
      expect(screen.getByText('John Doe - active')).toBeInTheDocument()
    })

    it('should use default cell renderer when custom renderer is not provided', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      const { container } = render(<TestTable config={config} data={testData} />)
      const cells = container.querySelectorAll('tbody td div')
      expect(cells[0]).toHaveTextContent('John Doe')
    })
  })

  describe('actions column', () => {
    it('should add actions column when enableActions is true', () => {
      const config: TableConfig<TestData> = {
        enableActions: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
        actions: {
          items: [
            { label: 'Edit', onClick: vi.fn() },
          ],
        },
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(2)
      expect(columns[1].id).toBe('actions')
    })

    it('should render actions dropdown menu', () => {
      const config: TableConfig<TestData> = {
        enableActions: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
        actions: {
          items: [
            { label: 'Edit', onClick: vi.fn() },
          ],
        },
      }

      render(<TestTable config={config} data={testData} />)
      const menuButtons = screen.getAllByRole('button', { name: /Open menu/i })
      expect(menuButtons).toHaveLength(2)
    })

    it('should render action items in dropdown', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      const onDelete = vi.fn()

      const config: TableConfig<TestData> = {
        enableActions: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
        actions: {
          items: [
            { label: 'Edit', onClick: onEdit },
            { label: 'Delete', onClick: onDelete },
          ],
        },
      }

      render(<TestTable config={config} data={testData} />)
      const menuButton = screen.getAllByRole('button', { name: /Open menu/i })[0]
      await user.click(menuButton)

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should call action onClick handler when clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()

      const config: TableConfig<TestData> = {
        enableActions: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
        actions: {
          items: [
            { label: 'Edit', onClick: onEdit },
          ],
        },
      }

      render(<TestTable config={config} data={testData} />)
      const menuButton = screen.getAllByRole('button', { name: /Open menu/i })[0]
      await user.click(menuButton)

      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      expect(onEdit).toHaveBeenCalledWith(testData[0])
    })

    it('should not add actions column when enableActions is false', () => {
      const config: TableConfig<TestData> = {
        enableActions: false,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(1)
      expect(columns.find(col => col.id === 'actions')).toBeUndefined()
    })

    it('should render actions label when provided', async () => {
      const user = userEvent.setup()

      const config: TableConfig<TestData> = {
        enableActions: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
        actions: {
          label: 'Actions Menu',
          items: [
            { label: 'Edit', onClick: vi.fn() },
          ],
        },
      }

      render(<TestTable config={config} data={testData} />)
      const menuButton = screen.getAllByRole('button', { name: /Open menu/i })[0]
      await user.click(menuButton)

      expect(screen.getByText('Actions Menu')).toBeInTheDocument()
    })
  })

  describe('complex configurations', () => {
    it('should handle all features together', () => {
      const config: TableConfig<TestData> = {
        enableSelection: true,
        enableActions: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email', enableSorting: false },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: (value) => <span className="status">{value}</span>,
          },
        ],
        actions: {
          items: [
            { label: 'View', onClick: vi.fn() },
          ],
        },
      }

      const columns = createColumns(config)
      // selection + 3 data columns + actions = 5
      expect(columns).toHaveLength(5)
      expect(columns[0].id).toBe('select')
      expect(columns[4].id).toBe('actions')
    })

    it('should render complete table with all features', () => {
      const config: TableConfig<TestData> = {
        enableSelection: true,
        enableActions: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email' },
        ],
        actions: {
          items: [
            { label: 'Edit', onClick: vi.fn() },
          ],
        },
      }

      render(<TestTable config={config} data={testData} />)
      
      // Check headers
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      
      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      
      // Check selection
      expect(screen.getByLabelText('Select all')).toBeInTheDocument()
      expect(screen.getAllByLabelText('Select row')).toHaveLength(2)
      
      // Check actions
      expect(screen.getAllByRole('button', { name: /Open menu/i })).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty data array', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name' },
        ],
      }

      const { container } = render(<TestTable config={config} data={[]} />)
      expect(container.querySelector('tbody')?.children).toHaveLength(0)
    })

    it('should handle multiple columns with different configurations', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name', enableSorting: true },
          { accessorKey: 'email', header: 'Email', enableSorting: false },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: (value) => <span>{value}</span>,
          },
        ],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(3)
    })
  })
})
