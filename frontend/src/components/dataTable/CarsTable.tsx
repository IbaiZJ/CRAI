import { DataTable } from "@/components/dataTable/lib/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ArrowUpDown } from "lucide-react"

export interface Vehicle {
  plate: string;
  badge: string | null;
  userId: string | null;
  vehicleTypeId: number | null;
}

interface User {
  username: string;
  name: string;
  surname: string;
}

type Props = {
  readonly data: Vehicle[];
  readonly users: User[];
  readonly onEdit: (vehicle: Vehicle) => void;
  readonly onDelete: (plate: string) => void;
}

const getUserName = (userId: string | null, users: User[]) => {
  if (!userId) return "-";
  const user = users.find(u => u.username === userId);
  return user ? `${user.name} ${user.surname}` : userId;
};

export default function CarsTable({ data, users, onEdit, onDelete }: Readonly<Props>) {
  const carsColumns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "plate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Plate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium font-mono">{row.getValue("plate")}</div>,
    },
    {
      accessorKey: "badge",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Badge
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("badge") || "-"}</div>,
    },
    {
      accessorKey: "userId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Owner
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{getUserName(row.getValue("userId"), users)}</div>,
    },
    {
      accessorKey: "vehicleTypeId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vehicle Type ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("vehicleTypeId") || "-"}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            title="Edit vehicle"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original.plate)}
            title="Delete vehicle"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={carsColumns}
      data={data}
      searchPlaceholder="Search vehicles by plate, owner..."
      enableColumnVisibility={true}
      enableRowSelection={false}
      enableGlobalFilter={true}
    />
  );
}
