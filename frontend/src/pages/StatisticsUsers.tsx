import { useEffect, useState } from "react";
import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "@/components/CountUp";
import { Users, UserCheck, Shield, User } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  policeUsers: number;
  regularUsers: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
}

export default function StatisticsUsers() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    policeUsers: 0,
    regularUsers: 0,
    usersByRole: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStatistics();
  }, []);

  const loadUserStatistics = async () => {
    try {
      setLoading(true);
      const usersRes = await fetch('http://localhost:1880/users');
      const usersData = await usersRes.json();

      // Process data - handle different response structures
      const users = Array.isArray(usersData) ? usersData : usersData.data || [];

      console.log('StatisticsUsers loaded:', { users: users.length });

      // Count users by role
      const roleCount = new Map<string, number>();
      let adminCount = 0;
      let policeCount = 0;
      let regularCount = 0;

      users.forEach((user: any) => {
        const role = user.role || 'user';
        roleCount.set(role, (roleCount.get(role) || 0) + 1);

        if (role === 'admin') adminCount++;
        else if (role === 'police') policeCount++;
        else regularCount++;
      });

      const usersByRole = Array.from(roleCount.entries())
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalUsers: users.length,
        activeUsers: users.length, // Assuming all users are active
        adminUsers: adminCount,
        policeUsers: policeCount,
        regularUsers: regularCount,
        usersByRole,
      });
    } catch (error) {
      console.error('Error loading user statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const barChartConfig = {
    count: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
  };

  const pieData = [
    { name: 'Admin', value: stats.adminUsers, color: 'hsl(var(--chart-1))' },
    { name: 'Police', value: stats.policeUsers, color: 'hsl(var(--chart-2))' },
    { name: 'Regular', value: stats.regularUsers, color: 'hsl(var(--chart-3))' },
  ];

  const adminPercentage = stats.totalUsers > 0 
    ? Math.round((stats.adminUsers / stats.totalUsers) * 100) 
    : 0;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Statistics", to: "/statistics" },
    { label: "Users" }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Statistics</h1>
          <p className="text-muted-foreground">System users and role distribution</p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : <CountUp to={stats.totalUsers} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "..." : <CountUp to={stats.adminUsers} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">{adminPercentage}% of total</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Police Officers</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? "..." : <CountUp to={stats.policeUsers} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 
                ? Math.round((stats.policeUsers / stats.totalUsers) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : <CountUp to={stats.regularUsers} duration={2} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 
                ? Math.round((stats.regularUsers / stats.totalUsers) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Role Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Users by role type</CardDescription>
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

        {/* Users by Role Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>User count per role</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : stats.usersByRole.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.usersByRole} layout="horizontal">
                    <XAxis type="category" dataKey="role" />
                    <YAxis type="number" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
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
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="font-medium">Administrators:</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {loading ? "..." : <CountUp to={stats.adminUsers} duration={1.5} />}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Police Officers:</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {loading ? "..." : <CountUp to={stats.policeUsers} duration={1.5} />}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <span className="font-medium">Regular Users:</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {loading ? "..." : <CountUp to={stats.regularUsers} duration={1.5} />}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Access</CardTitle>
            <CardDescription>User access and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Total Active Users:</span>
              <span className="text-muted-foreground">
                {loading ? "..." : <CountUp to={stats.activeUsers} duration={1.5} />}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="font-medium">Admin Access:</span>
              <span className="text-muted-foreground">{adminPercentage}% of users</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Law Enforcement:</span>
              <span className="text-muted-foreground">
                {stats.totalUsers > 0 
                  ? Math.round((stats.policeUsers / stats.totalUsers) * 100)
                  : 0}% of users
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
}
