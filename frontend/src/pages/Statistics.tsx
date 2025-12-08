import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { useEffect } from "react";

export default function Statistics() {
  useEffect(() => {
    document.title = "CRAI - Statistics";
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", to: "/dashboard" }, { label: "Statistics" }];

  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+8.2%",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Active Sessions",
      value: "1,234",
      change: "+23.1%",
      icon: Activity,
      color: "text-purple-500",
    },
    {
      title: "Growth",
      value: "28%",
      change: "+5.4%",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground mt-2">Overview of your application metrics and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: "January", value: 65, max: 100 },
                { month: "February", value: 78, max: 100 },
                { month: "March", value: 82, max: 100 },
                { month: "April", value: 88, max: 100 },
                { month: "May", value: 92, max: 100 },
                { month: "June", value: 95, max: 100 },
              ].map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{item.month}</span>
                    <span className="text-sm text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
