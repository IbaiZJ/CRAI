import { useEffect, useState } from "react";
import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "@/components/CountUp";
import { Car, CheckCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface VehicleStats {
  totalVehicles: number;
  validITV: number;
  expiredITV: number;
  expiringSoonITV: number;
  mostDetectedVehicles: Array<{
    licensePlate: string;
    detections: number;
  }>;
}

export default function StatisticsCars() {
  const [stats, setStats] = useState<VehicleStats>({
    totalVehicles: 0,
    validITV: 0,
    expiredITV: 0,
    expiringSoonITV: 0,
    mostDetectedVehicles: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarStatistics();
  }, []);

  const loadCarStatistics = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, detectionsRes] = await Promise.all([
        fetch('http://localhost:1880/vehicles'),
        fetch('http://localhost:1880/detections'),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const detectionsData = await detectionsRes.json();

      // Process data - handle different response structures
      const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.data || [];
      const detections = Array.isArray(detectionsData) ? detectionsData : detectionsData.data || [];

      console.log('StatisticsCars loaded:', { vehicles: vehicles.length, detections: detections.length });

      // Count unique vehicles by ITV status
      const vehicleItvStatus = new Map<string, string>();
      detections.forEach((d: any) => {
        if (!vehicleItvStatus.has(d.licensePlate)) {
          vehicleItvStatus.set(d.licensePlate, d.itvStatus);
        }
      });

      const validITV = Array.from(vehicleItvStatus.values()).filter(status => status === 'valid').length;
      const expiredITV = Array.from(vehicleItvStatus.values()).filter(status => status === 'expired').length;
      const expiringSoonITV = Array.from(vehicleItvStatus.values()).filter(status => status === 'expiring_soon').length;

      // Count detections per vehicle
      const detectionsByVehicle = new Map<string, number>();
      detections.forEach((d: any) => {
        detectionsByVehicle.set(d.licensePlate, (detectionsByVehicle.get(d.licensePlate) || 0) + 1);
      });

      const mostDetected = Array.from(detectionsByVehicle.entries())
        .map(([licensePlate, detections]) => ({ licensePlate, detections }))
        .sort((a, b) => b.detections - a.detections)
        .slice(0, 10);

      setStats({
        totalVehicles: vehicles.length,
        validITV,
        expiredITV,
        expiringSoonITV,
        mostDetectedVehicles: mostDetected,
      });
    } catch (error) {
      console.error('Error loading car statistics:', error);
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

  const pieData = [
    { name: 'Valid', value: stats.validITV, color: 'hsl(var(--chart-2))' },
    { name: 'Expiring Soon', value: stats.expiringSoonITV, color: 'hsl(var(--chart-3))' },
    { name: 'Expired', value: stats.expiredITV, color: 'hsl(var(--chart-1))' },
  ];

  const validPercentage = stats.totalVehicles > 0 
    ? Math.round((stats.validITV / stats.totalVehicles) * 100) 
    : 0;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Statistics", to: "/statistics" },
    { label: "Cars" }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Statistics</h1>
          <p className="text-muted-foreground">Comprehensive vehicle and ITV status metrics</p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : <CountUp to={stats.totalVehicles} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid ITV</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : <CountUp to={stats.validITV} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">{validPercentage}% of total</p>
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
              {stats.totalVehicles > 0 
                ? Math.round((stats.expiringSoonITV / stats.totalVehicles) * 100)
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
              {stats.totalVehicles > 0 
                ? Math.round((stats.expiredITV / stats.totalVehicles) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* ITV Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ITV Status Distribution</CardTitle>
            <CardDescription>Vehicle ITV status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <PieChart width={300} height={300}>
                  <Pie
                    data={pieData}
                    cx={150}
                    cy={150}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Detected Vehicles Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Most Detected Vehicles</CardTitle>
            <CardDescription>Top 10 vehicles by detection count</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : stats.mostDetectedVehicles.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.mostDetectedVehicles} layout="horizontal">
                    <XAxis type="category" dataKey="licensePlate" />
                    <YAxis type="number" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="detections" fill="hsl(var(--chart-1))" radius={4} />
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
            <CardTitle>Compliance Overview</CardTitle>
            <CardDescription>ITV compliance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Compliant Vehicles:</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {loading ? "..." : <CountUp to={stats.validITV} duration={1.5} />}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium">Non-Compliant:</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {loading ? "..." : <CountUp to={stats.expiredITV} duration={1.5} />}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Requires Attention:</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {loading ? "..." : <CountUp to={stats.expiringSoonITV} duration={1.5} />}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detection Insights</CardTitle>
            <CardDescription>Vehicle detection patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Most Active Vehicle:</span>
              <span className="text-muted-foreground">
                {stats.mostDetectedVehicles.length > 0 
                  ? stats.mostDetectedVehicles[0].licensePlate
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Detection Record:</span>
              <span className="text-muted-foreground">
                {stats.mostDetectedVehicles.length > 0 
                  ? `${stats.mostDetectedVehicles[0].detections} detections`
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Compliance Rate:</span>
              <span className="text-muted-foreground">{validPercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
}
