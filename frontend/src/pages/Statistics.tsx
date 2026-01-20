import { useEffect, useState } from "react";
import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "@/components/CountUp";
import { Activity, Car, Users, Camera, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartBarStacked } from "@/components/charts/barCharts/chart-bar-stacked";

interface Stats {
  totalVehicles: number;
  totalUsers: number;
  totalCameras: number;
  totalDetections: number;
  validITV: number;
  expiredITV: number;
  expiringSoonITV: number;
}

interface DetectionsByMonth {
  month: string;
  detections: number;
}

interface ItvStatusTrend {
  month: string;
  valid: number;
  expired: number;
  expiring: number;
}

export default function Statistics() {
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    totalUsers: 0,
    totalCameras: 0,
    totalDetections: 0,
    validITV: 0,
    expiredITV: 0,
    expiringSoonITV: 0,
  });
  const [detectionsByMonth, setDetectionsByMonth] = useState<DetectionsByMonth[]>([]);
  const [itvTrend, setItvTrend] = useState<ItvStatusTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, usersRes, camerasRes, detectionsRes] = await Promise.all([
        fetch('http://localhost:1880/vehicles'),
        fetch('http://localhost:1880/users'),
        fetch('http://localhost:1880/cameras'),
        fetch('http://localhost:1880/detections'),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const usersData = await usersRes.json();
      const camerasData = await camerasRes.json();
      const detectionsData = await detectionsRes.json();

      // Process data - handle different response structures
      const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.data || [];
      const users = Array.isArray(usersData) ? usersData : usersData.data || [];
      const cameras = Array.isArray(camerasData) ? camerasData : camerasData.data || [];
      const detections = Array.isArray(detectionsData) ? detectionsData : detectionsData.data || [];

      console.log('Statistics loaded:', { vehicles: vehicles.length, users: users.length, cameras: cameras.length, detections: detections.length });

      // Calculate ITV status
      const validITV = detections.filter((d: any) => d.itvStatus === 'valid').length;
      const expiredITV = detections.filter((d: any) => d.itvStatus === 'expired').length;
      const expiringSoonITV = detections.filter((d: any) => d.itvStatus === 'expiring_soon').length;

      // Group detections by month (last 6 months)
      const monthlyData = new Map<string, number>();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      detections.forEach((detection: any) => {
        const date = new Date(detection.detectionDate);
        if (date >= sixMonthsAgo) {
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
        }
      });

      const monthlyDetections = Array.from(monthlyData.entries())
        .map(([month, detections]) => ({ month, detections }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      // Calculate ITV trend by month
      const itvByMonth = new Map<string, { valid: number; expired: number; expiring: number }>();
      
      detections.forEach((detection: any) => {
        const date = new Date(detection.detectionDate);
        if (date >= sixMonthsAgo) {
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const current = itvByMonth.get(monthKey) || { valid: 0, expired: 0, expiring: 0 };
          
          if (detection.itvStatus === 'valid') current.valid++;
          else if (detection.itvStatus === 'expired') current.expired++;
          else if (detection.itvStatus === 'expiring_soon') current.expiring++;
          
          itvByMonth.set(monthKey, current);
        }
      });

      const itvTrendData = Array.from(itvByMonth.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setStats({
        totalVehicles: vehicles.length,
        totalUsers: users.length,
        totalCameras: cameras.length,
        totalDetections: detections.length,
        validITV,
        expiredITV,
        expiringSoonITV,
      });

      setDetectionsByMonth(monthlyDetections);
      setItvTrend(itvTrendData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    detections: {
      label: "Detections",
      color: "hsl(var(--chart-1))",
    },
  };

  const validPercentage = stats.totalDetections > 0 
    ? Math.round((stats.validITV / stats.totalDetections) * 100) 
    : 0;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Statistics" }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Statistics</h1>
          <p className="text-muted-foreground">Complete overview of system metrics</p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : <CountUp to={stats.totalDetections} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">All vehicle detections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : <CountUp to={stats.totalVehicles} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">Registered vehicles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cameras</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : <CountUp to={stats.totalCameras} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">Active cameras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : <CountUp to={stats.totalUsers} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">System users</p>
          </CardContent>
        </Card>
      </div>

      {/* ITV Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid ITV</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : <CountUp to={stats.validITV} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {validPercentage}% of total detections
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? "..." : <CountUp to={stats.expiringSoonITV} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDetections > 0 
                ? Math.round((stats.expiringSoonITV / stats.totalDetections) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired ITV</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "..." : <CountUp to={stats.expiredITV} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDetections > 0 
                ? Math.round((stats.expiredITV / stats.totalDetections) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Detections Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Trends</CardTitle>
            <CardDescription>Monthly vehicle detections (Last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : detectionsByMonth.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detectionsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="detections" 
                      fill="hsl(var(--chart-1))" 
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* ITV Status Trend using ChartBarStacked */}
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>ITV Status Trends</CardTitle>
              <CardDescription>Monthly ITV status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            </CardContent>
          </Card>
        ) : itvTrend.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>ITV Status Trends</CardTitle>
              <CardDescription>Monthly ITV status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            </CardContent>
          </Card>
        ) : (
          <ChartBarStacked
            data={itvTrend}
            title="ITV Status Trends"
            description="Monthly ITV status distribution"
            dataKeys={[
              { key: 'valid', label: 'Valid', color: 'hsl(var(--chart-2))' },
              { key: 'expiring', label: 'Expiring Soon', color: 'hsl(var(--chart-3))' },
              { key: 'expired', label: 'Expired', color: 'hsl(var(--chart-1))' }
            ]}
            categoryKey="month"
            showFooter={false}
          />
        )}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Overall system performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-medium">Detection Rate:</span>
            <span className="text-muted-foreground">
              {detectionsByMonth.length > 0 
                ? `${Math.round(detectionsByMonth.reduce((acc, m) => acc + m.detections, 0) / detectionsByMonth.length)} avg/month`
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium">ITV Compliance:</span>
            <span className="text-muted-foreground">{validPercentage}% valid</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Camera Efficiency:</span>
            <span className="text-muted-foreground">
              {stats.totalCameras > 0 
                ? `${Math.round(stats.totalDetections / stats.totalCameras)} detections/camera`
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}
