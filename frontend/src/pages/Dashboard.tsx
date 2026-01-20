import { useEffect, useMemo, useState } from "react";
import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Camera, Car, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Legend, Tooltip, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartAreaInteractive } from "@/components/charts/chart-area-interactive";
import DetectionsTable, { type Detection } from "@/components/dataTable/DetectionsTable";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface DashboardStats {
  totalVehicles: number;
  totalCameras: number;
  totalUsers: number;
  totalDetections: number;
  validITV: number;
  expiredITV: number;
  expiringSoonITV: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalCameras: 0,
    totalUsers: 0,
    totalDetections: 0,
    validITV: 0,
    expiredITV: 0,
    expiringSoonITV: 0,
  });
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [detectionsByDate, setDetectionsByDate] = useState<Array<{ date: string; detections: number }>>([]);
  const [detectionsByCamera, setDetectionsByCamera] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "CRAI - Dashboard";
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel fetch of all data
      const [vehiclesRes, camerasRes, usersRes, detectionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vehicles`),
        fetch(`${API_BASE_URL}/cameras`),
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/detections`),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const camerasData = await camerasRes.json();
      const usersData = await usersRes.json();
      const detectionsData = await detectionsRes.json();

      // Process vehicles
      const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.data || [];
      
      // Process cameras
      const cameras = Array.isArray(camerasData) ? camerasData : camerasData.data || [];
      
      // Process users
      const users = Array.isArray(usersData) ? usersData : usersData.data || [];
      
      // Process detections
      let detections: Detection[] = [];
      if (detectionsData.success && detectionsData.data) {
        detections = detectionsData.data;
      } else if (Array.isArray(detectionsData)) {
        detections = detectionsData;
      }

      // Calculate ITV status counts
      const validITV = detections.filter(d => d.itvStatus === 'valid').length;
      const expiredITV = detections.filter(d => d.itvStatus === 'expired').length;
      const expiringSoonITV = detections.filter(d => d.itvStatus === 'expiring_soon').length;

      // Group detections by date (last 30 days)
      const detectionsByDateMap = new Map<string, number>();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      detections.forEach(detection => {
        const detectionDate = new Date(detection.detectionDate);
        if (detectionDate >= thirtyDaysAgo) {
          const dateKey = detectionDate.toISOString().split('T')[0];
          detectionsByDateMap.set(dateKey, (detectionsByDateMap.get(dateKey) || 0) + 1);
        }
      });

      const sortedDetectionsByDate = Array.from(detectionsByDateMap.entries())
        .map(([date, count]) => ({ date, detections: count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Group detections by camera
      const detectionsByCameraMap = new Map<number, { valid: number; expired: number; expiring: number }>();
      detections.forEach(detection => {
        if (!detectionsByCameraMap.has(detection.cameraId)) {
          detectionsByCameraMap.set(detection.cameraId, { valid: 0, expired: 0, expiring: 0 });
        }
        const cameraStats = detectionsByCameraMap.get(detection.cameraId)!;
        if (detection.itvStatus === 'valid') cameraStats.valid++;
        else if (detection.itvStatus === 'expired') cameraStats.expired++;
        else if (detection.itvStatus === 'expiring_soon') cameraStats.expiring++;
      });

      const detectionsByCameraArray = Array.from(detectionsByCameraMap.entries())
        .map(([cameraId, stats]) => ({
          camera: `Cam ${cameraId}`,
          valid: stats.valid,
          expired: stats.expired,
          expiring: stats.expiring,
        }))
        .sort((a, b) => (b.valid + b.expired + b.expiring) - (a.valid + a.expired + a.expiring))
        .slice(0, 10); // Top 10 cameras

      // Get recent detections (last 10)
      const sortedDetections = [...detections].sort((a, b) => 
        new Date(b.detectionDate).getTime() - new Date(a.detectionDate).getTime()
      );

      setStats({
        totalVehicles: vehicles.length,
        totalCameras: cameras.length,
        totalUsers: users.length,
        totalDetections: detections.length,
        validITV,
        expiredITV,
        expiringSoonITV,
      });

      setRecentDetections(sortedDetections.slice(0, 10));
      setDetectionsByDate(sortedDetectionsByDate);
      setDetectionsByCamera(detectionsByCameraArray);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard" },
  ];

  const name = useMemo(() => {
    if (user?.fullName) return user.fullName;
    if (user?.name) return user.name;
    return user?.surname || 'Guest';
  }, [user]);

  const itvChartConfig = {
    valid: {
      label: "Valid ITV",
      color: "hsl(142 76% 36%)",
    },
    expired: {
      label: "Expired ITV",
      color: "hsl(0 84% 60%)",
    },
    expiring: {
      label: "Expiring Soon",
      color: "hsl(48 96% 53%)",
    },
  };

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-semibold text-center leading-tight py-2">
            Hello, {name}!
          </h1>
          <p className="text-center text-muted-foreground">
            Welcome to your CRAI Dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalDetections.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Vehicle detections tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalVehicles.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cameras</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalCameras.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active surveillance cameras
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                System users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ITV Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Valid ITV</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{loading ? "..." : stats.validITV.toLocaleString()}</div>
              <p className="text-xs text-green-600">
                {stats.totalDetections > 0 ? `${((stats.validITV / stats.totalDetections) * 100).toFixed(1)}% of detections` : "No detections"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">{loading ? "..." : stats.expiringSoonITV.toLocaleString()}</div>
              <p className="text-xs text-yellow-600">
                {stats.totalDetections > 0 ? `${((stats.expiringSoonITV / stats.totalDetections) * 100).toFixed(1)}% of detections` : "No detections"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Expired ITV</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{loading ? "..." : stats.expiredITV.toLocaleString()}</div>
              <p className="text-xs text-red-600">
                {stats.totalDetections > 0 ? `${((stats.expiredITV / stats.totalDetections) * 100).toFixed(1)}% of detections` : "No detections"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detections Over Time - Interactive Chart */}
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Detections Timeline</CardTitle>
              <CardDescription>Vehicle detections over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            </CardContent>
          </Card>
        ) : detectionsByDate.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Detections Timeline</CardTitle>
              <CardDescription>Vehicle detections over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No detection data available
              </div>
            </CardContent>
          </Card>
        ) : (
          <ChartAreaInteractive
            data={detectionsByDate}
            title="Detections Timeline"
            description="Daily vehicle detections for the last 90 days"
            dataKeys={[{ key: 'detections', label: 'Detections', color: 'hsl(var(--chart-1))' }]}
          />
        )}

        {/* Detections by Camera - ITV Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>ITV Status by Camera</CardTitle>
            <CardDescription>Top 10 cameras with detection breakdown by ITV status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : detectionsByCamera.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No camera data available
              </div>
            ) : (
              <ChartContainer config={itvChartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detectionsByCamera}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="camera" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="valid" fill="hsl(142 76% 36%)" name="Valid ITV" stackId="a" />
                    <Bar dataKey="expiring" fill="hsl(48 96% 53%)" name="Expiring Soon" stackId="a" />
                    <Bar dataKey="expired" fill="hsl(0 84% 60%)" name="Expired ITV" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Detections Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Detections</CardTitle>
            <CardDescription>Latest 10 vehicle detections</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading detections...
              </div>
            ) : (
              <DetectionsTable data={recentDetections} />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
