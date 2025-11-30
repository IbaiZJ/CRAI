import Layout from "@/layouts/Layout";
import { useEffect } from "react";

export default function Users() {
  useEffect(() => {
    document.title = "CRAI - Users";
  }, []);

  return (
    <Layout>
      <div>
        <h1>Users Page</h1>
        <p>This is the protected Users page.</p>
      </div>
    </Layout>
  );
}
