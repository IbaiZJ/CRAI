import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Fuel, Gauge, AlertCircle, Activity } from "lucide-react";
import { useEffect } from "react";

export default function Cars() {
  useEffect(() => {
    document.title = "CRAI - Cars";
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", to: "/dashboard" }, { label: "Cars" }];

  const cars = [
    {
      id: "VEH-001",
      plate: "ABC-1234",
      model: "Tesla Model 3",
      color: "White",
      status: "active",
      location: "Zone A - Parking 12",
      speed: "0 km/h",
      fuel: "85%",
    },
    {
      id: "VEH-002",
      plate: "XYZ-5678",
      model: "Toyota Camry",
      color: "Black",
      status: "moving",
      location: "Route 45 - Sector 3",
      speed: "65 km/h",
      fuel: "42%",
    },
    {
      id: "VEH-003",
      plate: "DEF-9012",
      model: "Honda Civic",
      color: "Blue",
      status: "maintenance",
      location: "Workshop - Bay 2",
      speed: "0 km/h",
      fuel: "15%",
    },
    {
      id: "VEH-004",
      plate: "GHI-3456",
      model: "Ford Explorer",
      color: "Silver",
      status: "active",
      location: "Zone B - Parking 5",
      speed: "0 km/h",
      fuel: "92%",
    },
    {
      id: "VEH-005",
      plate: "JKL-7890",
      model: "BMW X5",
      color: "Black",
      status: "moving",
      location: "Highway 101 - Mile 23",
      speed: "88 km/h",
      fuel: "68%",
    },
    {
      id: "VEH-006",
      plate: "MNO-2345",
      model: "Audi A4",
      color: "Red",
      status: "inactive",
      location: "Zone C - Parking 18",
      speed: "0 km/h",
      fuel: "5%",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "moving":
        return <Badge className="bg-blue-500">Moving</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFuelColor = (fuel: string) => {
    const percentage = parseInt(fuel);
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const stats = [
    {
      title: "Total Vehicles",
      value: cars.length.toString(),
      icon: Car,
      color: "text-blue-500",
    },
    {
      title: "Active",
      value: cars.filter((c) => c.status === "active").length.toString(),
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Moving",
      value: cars.filter((c) => c.status === "moving").length.toString(),
      icon: Gauge,
      color: "text-blue-500",
    },
    {
      title: "Maintenance",
      value: cars.filter((c) => c.status === "maintenance").length.toString(),
      icon: AlertCircle,
      color: "text-yellow-500",
    },
  ];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage all vehicles in real-time</p>
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
          {cars.map((car) => (
            <Card key={car.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{car.model}</CardTitle>
                    <p className="text-sm font-mono text-muted-foreground">{car.plate}</p>
                  </div>
                  {getStatusBadge(car.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vehicle ID:</span>
                    <span className="font-medium">{car.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{car.color}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location:
                    </span>
                    <span className="font-medium text-right max-w-[60%]">{car.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      Speed:
                    </span>
                    <span className="font-medium">{car.speed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      Fuel:
                    </span>
                    <span className={`font-medium ${getFuelColor(car.fuel)}`}>{car.fuel}</span>
                  </div>
                  <div className="mt-4 aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Car className="h-12 w-12 text-muted-foreground" />
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
