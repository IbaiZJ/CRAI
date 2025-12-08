import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { useEffect } from "react";

export default function Users() {
  useEffect(() => {
    document.title = "CRAI - Users";
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Users" },
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div>
        <h1>Users Page</h1>
        <p>This is the protected Users page.</p>
      </div>
    </Layout>
  );
}
