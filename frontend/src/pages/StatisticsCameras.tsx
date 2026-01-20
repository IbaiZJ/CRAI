import { useEffect, useState } from "react";
import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "@/components/CountUp";
import { Camera, Activity, MapPin, TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface CameraStats {
  totalCameras: number;
  activeCameras: number;
  totalDetections: number;
  avgDetectionsPerCamera: number;
  mostActiveCameras: Array<{
    cameraId: number;
    location: string;
    detections: number;
  }>;
  leastActiveCameras: Array<{
    cameraId: number;
    location: string;
    detections: number;
  }>;
}

export default function StatisticsCameras() {
  const [stats, setStats] = useState<CameraStats>({
    totalCameras: 0,
    activeCameras: 0,
    totalDetections: 0,
    avgDetectionsPerCamera: 0,
    mostActiveCameras: [],
    leastActiveCameras: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCameraStatistics();
  }, []);

  const loadCameraStatistics = async () => {
    try {
      setLoading(true);
      const [camerasRes, detectionsRes] = await Promise.all([
        fetch('http://localhost:1880/cameras'),
        fetch('http://localhost:1880/detections'),
      ]);

      const camerasData = await camerasRes.json();
      const detectionsData = await detectionsRes.json();

      // Process data - handle different response structures
      const cameras = Array.isArray(camerasData) ? camerasData : camerasData.data || [];
      const detections = Array.isArray(detectionsData) ? detectionsData : detectionsData.data || [];

      console.log('StatisticsCameras loaded:', { cameras: cameras.length, detections: detections.length });

      // Count detections per camera
      const detectionsByCamera = new Map<number, { location: string; count: number }>();
      
      detections.forEach((d: any) => {
        const current = detectionsByCamera.get(d.cameraId) || { location: '', count: 0 };
        detectionsByCamera.set(d.cameraId, {
          location: current.location,
          count: current.count + 1,
        });
      });

      // Get camera locations
      cameras.forEach((camera: any) => {
        const current = detectionsByCamera.get(camera.id);
        if (current) {
          detectionsByCamera.set(camera.id, {
            ...current,
            location: camera.location || `Camera ${camera.id}`,
          });
        } else {
          detectionsByCamera.set(camera.id, {
            location: camera.location || `Camera ${camera.id}`,
            count: 0,
          });
        }
      });

      const cameraActivity = Array.from(detectionsByCamera.entries())
        .map(([cameraId, data]) => ({
          cameraId,
          location: data.location,
          detections: data.count,
        }))
        .sort((a, b) => b.detections - a.detections);

      const mostActive = cameraActivity.slice(0, 10);
      const leastActive = cameraActivity.slice(-5).reverse();
      const avgDetections = cameras.length > 0 
        ? Math.round(detections.length / cameras.length)
        : 0;

      setStats({
        totalCameras: cameras.length,
        activeCameras: cameraActivity.filter(c => c.detections > 0).length,
        totalDetections: detections.length,
        avgDetectionsPerCamera: avgDetections,
        mostActiveCameras: mostActive,
        leastActiveCameras: leastActive,
      });
    } catch (error) {
      console.error('Error loading camera statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const barChartConfig = {
    detections: {
      label: "Detections",
      color: "hsl(var(--chart-1))",
    },
  };

  const activityPercentage = stats.totalCameras > 0 
    ? Math.round((stats.activeCameras / stats.totalCameras) * 100) 
    : 0;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Statistics", to: "/statistics" },
    { label: "Cameras" }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Camera Statistics</h1>
          <p className="text-muted-foreground">Camera performance and detection metrics</p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cameras</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : <CountUp to={stats.totalCameras} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">Installed in system</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : <CountUp to={stats.activeCameras} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">{activityPercentage}% operational</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? "..." : <CountUp to={stats.totalDetections} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">All cameras combined</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Camera</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? "..." : <CountUp to={stats.avgDetectionsPerCamera} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">Detections per camera</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Active Cameras */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Cameras</CardTitle>
            <CardDescription>Top 10 cameras by detection count</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : stats.mostActiveCameras.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ChartContainer config={barChartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.mostActiveCameras} layout="vertical">
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="location" 
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="detections" fill="hsl(var(--chart-1))" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Least Active Cameras */}
        <Card>
          <CardHeader>
            <CardTitle>Least Active Cameras</CardTitle>
            <CardDescription>Bottom 5 cameras requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : stats.leastActiveCameras.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ChartContainer config={barChartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.leastActiveCameras} layout="vertical">
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="location" 
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="detections" fill="hsl(var(--chart-3))" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Camera efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="font-medium">Operational Rate:</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {activityPercentage}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Avg Detections:</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {loading ? "..." : <CountUp to={stats.avgDetectionsPerCamera} duration={1.5} />}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Total Installed:</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {loading ? "..." : <CountUp to={stats.totalCameras} duration={1.5} />}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Insights</CardTitle>
            <CardDescription>Detection patterns and highlights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Most Active Location:</span>
              <span className="text-muted-foreground">
                {stats.mostActiveCameras.length > 0 
                  ? stats.mostActiveCameras[0].location
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Highest Detection Count:</span>
              <span className="text-muted-foreground">
                {stats.mostActiveCameras.length > 0 
                  ? `${stats.mostActiveCameras[0].detections} detections`
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="font-medium">Active Cameras:</span>
              <span className="text-muted-foreground">
                {loading ? "..." : `${stats.activeCameras} of ${stats.totalCameras}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
}
