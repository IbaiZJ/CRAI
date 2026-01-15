import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, FileText, Users, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import CountUp from "@/components/CountUp";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CarData {
  plate: string;
  badge: string;
  userId: number;
  itv: string;
}

export default function Cars() {
  const notifications = useNotifications();
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", to: "/dashboard" }, { label: "Cars" }];

  useEffect(() => {
    document.title = "CRAI - Cars";
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/vehicles`);
        if (response.ok) {
          const data = await response.json();
          setCars(data);
        } else {
          throw new Error("Failed to fetch vehicles");
        }
      } catch (error: any) {
        notifications.error("Error fetching vehicles data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [notifications]);

  // Calcular estadísticas desde los datos del fetch
  const uniqueUsers = new Set(cars.map((car) => car.userId)).size;
  const uniqueBadges = new Set(cars.map((car) => car.badge)).size;
  const expiredITV = cars.filter((car) => {
    const itvDate = new Date(car.itv);
    return itvDate < new Date();
  }).length;

  const stats = [
    {
      title: "Total Vehicles",
      value: cars.length,
      icon: Car,
      color: "text-blue-500",
    },
    {
      title: "Unique Users",
      value: uniqueUsers,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Badge Types",
      value: uniqueBadges,
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Expired ITV",
      value: expiredITV,
      icon: Calendar,
      color: "text-red-500",
    },
  ];

  const isITVExpired = (itv: string) => {
    const itvDate = new Date(itv);
    return itvDate < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
                  <div className="text-2xl font-bold">
                    {loading ? (
                      "..."
                    ) : (
                      <CountUp to={stat.value} className="text-2xl font-bold" duration={1.5} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-muted-foreground">Loading vehicles...</div>
          </div>
        ) : cars.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-muted-foreground">No vehicles found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.map((car, index) => (
              <Card key={`${car.plate}-${index}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-mono">{car.plate}</CardTitle>
                      <p className="text-sm text-muted-foreground">Badge: {car.badge}</p>
                    </div>
                    {isITVExpired(car.itv) ? (
                      <Badge variant="destructive">ITV Expired</Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600">ITV Valid</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        User ID:
                      </span>
                      <span className="font-medium">{car.userId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        ITV:
                      </span>
                      <span
                        className={`font-medium ${
                          isITVExpired(car.itv) ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {formatDate(car.itv)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Badge:
                      </span>
                      <span className="font-medium">{car.badge}</span>
                    </div>
                    <div className="mt-4 aspect-video bg-muted rounded-md flex items-center justify-center">
                      <Car className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
