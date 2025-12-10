import { DataTable } from "@/components/dataTable/lib/data-table.tsx"
import { createColumns } from "@/components/dataTable/lib/createColumns.tsx"
import type { Payment } from "@/constants/paymentConstant"

type Props = {
  data: Payment[]
}

const paymentColumns = createColumns<Payment>({
  columns: [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
      cell: (value: string) => <div className="font-medium">{value}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (value: string) => <div className="capitalize">{value}</div>,
    },
    {
      accessorKey: "date",
      header: "Date",
      enableSorting: true,
      cell: (value: string) => <div className="text-sm text-muted-foreground">{value}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: (value: string) => <div className="lowercase">{value}</div>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      enableSorting: true,
      cell: (value: number) => {
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value)
        return <div className="font-medium">{formatted}</div>
      },
    },
  ],
})

export default function PaymentsTable({ data }: Props) {
  return (
    <DataTable
      columns={paymentColumns}
      data={data}
      searchPlaceholder="Filter by name, email, status..."
      enableColumnVisibility={true}
      enableRowSelection={false}
      enableGlobalFilter={true}
    />
  )
}
