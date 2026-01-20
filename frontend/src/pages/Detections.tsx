import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Loader2 } from "lucide-react";
import DetectionsTable, { type Detection } from "@/components/dataTable/DetectionsTable";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Detections() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const notifications = useNotifications();

  useEffect(() => {
    document.title = "CRAI - Detections";
    loadDetections();
  }, []);

  const loadDetections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/detections`);
      const result = await response.json();
      
      let data: Detection[] = [];
      if (result.success && result.data) {
        data = result.data;
      } else if (Array.isArray(result)) {
        data = result;
      } else {
        if (result.detections) {
            data = result.detections;
        }
      }

      // Sort by detectionDate descending (newest first)
      data.sort((a, b) => new Date(b.detectionDate).getTime() - new Date(a.detectionDate).getTime());

      setDetections(data);
    } catch (error) {
      console.error("Error loading detections:", error);
      notifications.error("Error loading detections");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Detections" },
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detections History</h2>
          <p className="text-muted-foreground">Complete log of detected vehicles and ITV status</p>
        </div>
        <div>
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <Loader2 className="h-8 w-8 animate-spin mr-2" />
               <span>Loading detections...</span>
             </div>
          ) : (
            <DetectionsTable data={detections} />
          )}
        </div>
      </div>
    </Layout>
  );
}