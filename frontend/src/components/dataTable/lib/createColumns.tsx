import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ColumnConfig<TData> {
  accessorKey: keyof TData
  header: string
  enableSorting?: boolean
  cell?: (value: any, row: TData) => React.ReactNode
}

export interface TableConfig<TData> {
  enableSelection?: boolean
  enableActions?: boolean
  columns: ColumnConfig<TData>[]
  actions?: {
    label?: string
    items: Array<{
      label: string
      onClick: (row: TData) => void
    }>
  }
}

export function createColumns<TData>(
  config: TableConfig<TData>
): ColumnDef<TData>[] {
  const columns: ColumnDef<TData>[] = []

  // Add selection column
  if (config.enableSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    })
  }

  // Add data columns
  config.columns.forEach((col) => {
    columns.push({
      accessorKey: col.accessorKey as string,
      header: col.enableSorting !== false
        ? ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="group cursor-pointer"
            >
              {col.header}
              <ArrowUpDown className="ml-2 h-4 w-4 text-gray-300 group-hover:text-gray-600 transition-colors duration-200" />
            </Button>
          )
        : col.header,
      cell: col.cell
        ? ({ row }) => col.cell!(row.getValue(col.accessorKey as string), row.original)
        : ({ row }) => {
            const value = row.getValue(col.accessorKey as string)
            return <div>{String(value)}</div>
          },
    })
  })

  // Add actions column
  if (config.enableActions && config.actions) {
    columns.push({
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {config.actions!.label || "Actions"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {config.actions!.items.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  onClick={() => action.onClick(row.original)}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    })
  }

  return columns
}
