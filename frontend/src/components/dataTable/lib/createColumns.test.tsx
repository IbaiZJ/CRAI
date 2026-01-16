import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createColumns, type TableConfig } from './createColumns'

interface TestData {
  id: number
  name: string
  email: string
  status: string
}

describe('createColumns', () => {
  describe('selection column', () => {
    it('should add selection column when enableSelection is true', () => {
      const config: TableConfig<TestData> = {
        enableSelection: true,
        columns: [],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(1)
      expect(columns[0].id).toBe('select')
    })

    it('should not add selection column when enableSelection is false', () => {
      const config: TableConfig<TestData> = {
        enableSelection: false,
        columns: [],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(0)
    })

    it('should not add selection column when enableSelection is undefined', () => {
      const config: TableConfig<TestData> = {
        columns: [],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(0)
    })

    it('selection column should have checkbox header', () => {
      const config: TableConfig<TestData> = {
        enableSelection: true,
        columns: [],
      }

      const columns = createColumns(config)
      const selectionColumn = columns[0]

      expect(selectionColumn.id).toBe('select')
      expect(selectionColumn.enableSorting).toBe(false)
      expect(selectionColumn.enableHiding).toBe(false)
    })
  })

  describe('data columns', () => {
    it('should create columns from config', () => {
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

    it('should add sorting button header when enableSorting is not false', () => {
      const config: TableConfig<TestData> = {
        columns: [{ accessorKey: 'name', header: 'Name' }],
      }

      const columns = createColumns(config)
      const nameColumn = columns[0]

      expect(typeof nameColumn.header).toBe('function')
    })

    it('should use plain header text when enableSorting is false', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name', enableSorting: false },
        ],
      }

      const columns = createColumns(config)
      const nameColumn = columns[0]

      expect(nameColumn.header).toBe('Name')
    })

    it('should use custom cell renderer when provided', () => {
      const customCell = vi.fn(() => <span>Custom</span>)
      const config: TableConfig<TestData> = {
        columns: [
          {
            accessorKey: 'name',
            header: 'Name',
            cell: customCell,
          },
        ],
      }

      const columns = createColumns(config)
      expect((columns[0] as any).cell).toBeDefined()
    })

    it('should use default cell renderer when not provided', () => {
      const config: TableConfig<TestData> = {
        columns: [{ accessorKey: 'name', header: 'Name' }],
      }

      const columns = createColumns(config)
      expect((columns[0] as any).cell).toBeDefined()
    })

    it('should handle multiple columns with different configurations', () => {
      const customCell = vi.fn(() => <span>Status Badge</span>)
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email', enableSorting: false },
          { accessorKey: 'status', header: 'Status', cell: customCell },
        ],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(3)
      expect(typeof columns[0].header).toBe('function') // Sortable
      expect(columns[1].header).toBe('Email') // Non-sortable plain text
      expect((columns[2] as any).cell).toBeDefined() // Custom cell
    })
  })

  describe('actions column', () => {
    it('should add actions column when enableActions is true and actions provided', () => {
      const mockAction = vi.fn()
      const config: TableConfig<TestData> = {
        columns: [],
        enableActions: true,
        actions: {
          items: [{ label: 'Edit', onClick: mockAction }],
        },
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(1)
      expect(columns[0].id).toBe('actions')
    })

    it('should not add actions column when enableActions is false', () => {
      const mockAction = vi.fn()
      const config: TableConfig<TestData> = {
        columns: [],
        enableActions: false,
        actions: {
          items: [{ label: 'Edit', onClick: mockAction }],
        },
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(0)
    })

    it('should not add actions column when actions is not provided', () => {
      const config: TableConfig<TestData> = {
        columns: [],
        enableActions: true,
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(0)
    })

    it('actions column should have correct properties', () => {
      const mockAction = vi.fn()
      const config: TableConfig<TestData> = {
        columns: [],
        enableActions: true,
        actions: {
          label: 'More',
          items: [{ label: 'Edit', onClick: mockAction }],
        },
      }

      const columns = createColumns(config)
      const actionsColumn = columns[0]

      expect(actionsColumn.id).toBe('actions')
      expect(actionsColumn.enableHiding).toBe(false)
    })

    it('should render multiple action items', () => {
      const mockEdit = vi.fn()
      const mockDelete = vi.fn()
      const config: TableConfig<TestData> = {
        columns: [],
        enableActions: true,
        actions: {
          items: [
            { label: 'Edit', onClick: mockEdit },
            { label: 'Delete', onClick: mockDelete },
          ],
        },
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(1)
      expect(columns[0].id).toBe('actions')
    })

    it('should use default action label when not provided', () => {
      const mockAction = vi.fn()
      const config: TableConfig<TestData> = {
        columns: [],
        enableActions: true,
        actions: {
          items: [{ label: 'Edit', onClick: mockAction }],
        },
      }

      const columns = createColumns(config)
      expect(columns[0].id).toBe('actions')
    })
  })

  describe('combined configurations', () => {
    it('should combine selection, data, and action columns', () => {
      const mockAction = vi.fn()
      const config: TableConfig<TestData> = {
        enableSelection: true,
        columns: [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email' },
        ],
        enableActions: true,
        actions: {
          items: [{ label: 'Edit', onClick: mockAction }],
        },
      }

      const columns = createColumns(config)
      // 1 selection + 2 data + 1 actions = 4
      expect(columns).toHaveLength(4)
      expect(columns[0].id).toBe('select')
      expect((columns[1] as any).accessorKey).toBe('name')
      expect((columns[2] as any).accessorKey).toBe('email')
      expect(columns[3].id).toBe('actions')
    })

    it('should handle empty columns array', () => {
      const config: TableConfig<TestData> = {
        enableSelection: true,
        columns: [],
        enableActions: false,
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(1)
      expect(columns[0].id).toBe('select')
    })

    it('should preserve column order: selection -> data -> actions', () => {
      const mockAction = vi.fn()
      const config: TableConfig<TestData> = {
        enableSelection: true,
        columns: [
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'name', header: 'Name' },
        ],
        enableActions: true,
        actions: {
          items: [{ label: 'Edit', onClick: mockAction }],
        },
      }

      const columns = createColumns(config)
      expect(columns[0].id).toBe('select')
      expect((columns[1] as any).accessorKey).toBe('id')
      expect((columns[2] as any).accessorKey).toBe('name')
      expect(columns[3].id).toBe('actions')
    })
  })

  describe('column configuration edge cases', () => {
    it('should handle column with both cell renderer and enableSorting false', () => {
      const customCell = vi.fn(() => <span>Custom</span>)
      const config: TableConfig<TestData> = {
        columns: [
          {
            accessorKey: 'status',
            header: 'Status',
            enableSorting: false,
            cell: customCell,
          },
        ],
      }

      const columns = createColumns(config)
      expect(columns[0].header).toBe('Status')
      expect((columns[0] as any).cell).toBeDefined()
    })

    it('should handle many columns', () => {
      const config: TableConfig<TestData> = {
        columns: [
          { accessorKey: 'id', header: 'ID' },
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email' },
          { accessorKey: 'status', header: 'Status' },
        ],
      }

      const columns = createColumns(config)
      expect(columns).toHaveLength(4)
    })

    it('should handle column without accessorKey type safety', () => {
      const config: TableConfig<TestData> = {
        columns: [{ accessorKey: 'name', header: 'Full Name' }],
      }

      const columns = createColumns(config)
      expect((columns[0] as any).accessorKey).toBe('name')
    })
  })
})
