import { DataTable } from "@/components/dataTable/lib/data-table"
import { createColumns } from "@/components/dataTable/lib/createColumns"
import { Badge } from "@/components/ui/badge"
import { users, type User } from "@/constants/userConstant"

// Crear columnas dinámicas
const userColumns = createColumns<User>({
  columns: [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
    },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: true,
      cell: (value: string) => (
        <Badge variant={value === "admin" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (value: string) => (
        <Badge variant={value === "active" ? "default" : "destructive"}>
          {value}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      enableSorting: true,
    },
  ],
})

export default function UsersTableExample() {
  return (
    <DataTable
      columns={userColumns}
      data={users}
      searchPlaceholder="Search users by name, email, role..."
      enableColumnVisibility={true}
      enableRowSelection={false}
      enableGlobalFilter={true}
    />
  )
}
