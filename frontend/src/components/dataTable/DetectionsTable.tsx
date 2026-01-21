import { DataTable } from "@/components/dataTable/lib/data-table"
import { createColumns } from "@/components/dataTable/lib/createColumns"
import { Badge } from "@/components/ui/badge"
import { Camera, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"

export interface Detection {
  id: number;
  vehicleId: string;
  cameraId: number;
  detectionDate: string;
  itvStatus: 'valid' | 'expired' | 'expiring_soon';
}

type Props = {
  readonly data: Detection[]
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  } catch (e) {
    return dateString;
  }
};

const getStatusBadge = (status: Detection['itvStatus']) => {
  switch (status) {
    case 'valid':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 w-fit">
          <CheckCircle className="h-3 w-3" />
          Valid ITV
        </Badge>
      );
    case 'expiring_soon':
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1 w-fit">
          <Clock className="h-3 w-3" />
          Expiring Soon
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
          <AlertTriangle className="h-3 w-3" />
          ITV EXPIRED
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const detectionsColumns = createColumns<Detection>({
  columns: [
    {
      accessorKey: "detectionDate",
      header: "Detection Date",
      enableSorting: true,
      cell: (value: string) => <div className="text-sm text-muted-foreground">{formatDate(value)}</div>,
    },
    {
      accessorKey: "vehicleId",
      header: "License Plate",
      enableSorting: true,
      cell: (value: string) => <div className="font-mono font-bold">{value}</div>,
    },
    {
      accessorKey: "cameraId",
      header: "Camera",
      enableSorting: true,
      cell: (value: number) => (
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span>Cam #{value}</span>
        </div>
      ),
    },
    {
      accessorKey: "itvStatus",
      header: "ITV Status",
      enableSorting: true,
      cell: (value: Detection['itvStatus']) => getStatusBadge(value),
    },
  ],
})

export default function DetectionsTable({ data }: Readonly<Props>) {
  return <DataTable columns={detectionsColumns} data={data} searchPlaceholder="Filter detections..." />
}
