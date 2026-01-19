import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="h-full border-none shadow-none md:border md:shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-6">
          <div>
            <CardTitle>Detections History</CardTitle>
            <CardDescription>Complete log of detected vehicles and ITV status</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6 pt-0">
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <Loader2 className="h-8 w-8 animate-spin mr-2" />
               <span>Loading detections...</span>
             </div>
          ) : (
            <DetectionsTable data={detections} />
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}