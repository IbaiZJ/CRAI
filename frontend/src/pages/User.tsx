import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { SpinnerCustom } from "@/components/Spinner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UserDetail() {
  useEffect(() => {
    document.title = "CRAI - User Details";
  }, []);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("User ID is missing");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", id));

        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });
          document.title = `CRAI - User ${userDoc.data().name || id}`;
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[400px] items-center justify-center">
          <SpinnerCustom />
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">User Not Found</h1>
            <Button onClick={() => navigate("/users")} variant="outline">
              Back to Users
            </Button>
          </div>

          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <p className="text-destructive font-medium">{error || "The user you're looking for doesn't exist."}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Details</h1>
          <Button onClick={() => navigate("/users")} variant="outline">
            Back to Users
          </Button>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">User ID: {user.id}</h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {user.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {user.email || "N/A"}
            </p>
            <p>
              <strong>Role:</strong> {user.role || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
