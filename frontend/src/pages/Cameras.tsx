import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, MapPin, Signal, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function Cameras() {
  useEffect(() => {
    document.title = "CRAI - Cameras";
  }, []);
  
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", to: "/dashboard" }, { label: "Cameras" }];

  const cameras = [
    {
      id: "CAM-001",
      name: "Main Entrance",
      location: "Building A - Floor 1",
      status: "online",
      quality: "1080p",
      fps: 30,
    },
    {
      id: "CAM-002",
      name: "Parking Lot",
      location: "Exterior - North",
      status: "online",
      quality: "4K",
      fps: 60,
    },
    {
      id: "CAM-003",
      name: "Lobby Camera",
      location: "Building A - Lobby",
      status: "maintenance",
      quality: "1080p",
      fps: 30,
    },
    {
      id: "CAM-004",
      name: "Back Exit",
      location: "Building B - Floor 1",
      status: "offline",
      quality: "720p",
      fps: 24,
    },
    {
      id: "CAM-005",
      name: "Conference Room",
      location: "Building A - Floor 3",
      status: "online",
      quality: "1080p",
      fps: 30,
    },
    {
      id: "CAM-006",
      name: "Server Room",
      location: "Building B - Basement",
      status: "online",
      quality: "4K",
      fps: 60,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-500">Online</Badge>;
      case "offline":
        return <Badge variant="destructive">Offline</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = [
    {
      title: "Total Cameras",
      value: cameras.length.toString(),
      icon: Video,
      color: "text-blue-500",
    },
    {
      title: "Online",
      value: cameras.filter((c) => c.status === "online").length.toString(),
      icon: Signal,
      color: "text-green-500",
    },
    {
      title: "Offline",
      value: cameras.filter((c) => c.status === "offline").length.toString(),
      icon: AlertCircle,
      color: "text-red-500",
    },
    {
      title: "Maintenance",
      value: cameras.filter((c) => c.status === "maintenance").length.toString(),
      icon: AlertCircle,
      color: "text-yellow-500",
    },
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cameras</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage all security cameras</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <Card key={camera.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{camera.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {camera.location}
                    </p>
                  </div>
                  {getStatusBadge(camera.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Camera ID:</span>
                    <span className="font-medium">{camera.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality:</span>
                    <span className="font-medium">{camera.quality}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frame Rate:</span>
                    <span className="font-medium">{camera.fps} FPS</span>
                  </div>
                  <div className="mt-4 aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
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
