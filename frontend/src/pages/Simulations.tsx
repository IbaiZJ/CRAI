import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Pause, RotateCcw, Clock, Zap, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import type React from "react";

// Helper functions to reduce cognitive complexity
const getProgressBarColor = (status: string): string => {
  if (status === "completed") return "bg-green-500";
  if (status === "running") return "bg-blue-500";
  if (status === "paused") return "bg-yellow-500";
  return "bg-gray-400";
};

const getActionButton = (status: string): React.ReactElement => {
  if (status === "running") {
    return (
      <Button size="sm" variant="outline" className="flex-1 gap-1">
        <Pause className="h-3 w-3" />
        Pause
      </Button>
    );
  }
  if (status === "paused") {
    return (
      <Button size="sm" variant="outline" className="flex-1 gap-1">
        <Play className="h-3 w-3" />
        Resume
      </Button>
    );
  }
  if (status === "pending") {
    return (
      <Button size="sm" className="flex-1 gap-1">
        <Play className="h-3 w-3" />
        Start
      </Button>
    );
  }
  return (
    <Button size="sm" variant="outline" className="flex-1 gap-1">
      <RotateCcw className="h-3 w-3" />
      View Results
    </Button>
  );
};

export default function Simulations() {
  useEffect(() => {
    document.title = "CRAI - Simulations";
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", to: "/dashboard" }, { label: "Simulations" }];

  const simulations = [
    {
      id: "SIM-001",
      name: "Traffic Flow Analysis",
      type: "Traffic",
      status: "running",
      progress: 75,
      duration: "2h 15m",
      accuracy: "94.5%",
    },
    {
      id: "SIM-002",
      name: "Crime Prediction Model",
      type: "Predictive",
      status: "completed",
      progress: 100,
      duration: "1h 45m",
      accuracy: "89.2%",
    },
    {
      id: "SIM-003",
      name: "Emergency Response",
      type: "Scenario",
      status: "paused",
      progress: 45,
      duration: "0h 35m",
      accuracy: "91.8%",
    },
    {
      id: "SIM-004",
      name: "Crowd Behavior",
      type: "Behavioral",
      status: "pending",
      progress: 0,
      duration: "0h 00m",
      accuracy: "N/A",
    },
    {
      id: "SIM-005",
      name: "Resource Allocation",
      type: "Optimization",
      status: "running",
      progress: 62,
      duration: "1h 20m",
      accuracy: "96.3%",
    },
    {
      id: "SIM-006",
      name: "Incident Reconstruction",
      type: "Forensic",
      status: "completed",
      progress: 100,
      duration: "3h 10m",
      accuracy: "92.7%",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-blue-500">Running</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = [
    {
      title: "Total Simulations",
      value: simulations.length.toString(),
      icon: Sparkles,
      color: "text-purple-500",
    },
    {
      title: "Running",
      value: simulations.filter((s) => s.status === "running").length.toString(),
      icon: Zap,
      color: "text-blue-500",
    },
    {
      title: "Completed",
      value: simulations.filter((s) => s.status === "completed").length.toString(),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Avg Accuracy",
      value: "92.5%",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Simulations</h1>
            <p className="text-muted-foreground mt-2">Create and manage AI-powered simulations</p>
          </div>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            New Simulation
          </Button>
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {simulations.map((sim) => (
            <Card key={sim.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{sim.name}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">{sim.type}</p>
                  </div>
                  {getStatusBadge(sim.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{sim.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressBarColor(sim.status)}`}
                        style={{ width: `${sim.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        Duration
                      </div>
                      <div className="font-medium">{sim.duration}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Accuracy
                      </div>
                      <div className="font-medium">{sim.accuracy}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {getActionButton(sim.status)}
                    <Button size="sm" variant="secondary">
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
