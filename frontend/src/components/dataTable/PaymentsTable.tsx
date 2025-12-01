import { DataTable } from "./data-table";
import { columns, type Payment } from "./columns";

type Props = {
  data: Payment[];
};

export default function PaymentsTable({ data }: Props) {
  return <DataTable columns={columns} data={data} />;
}
