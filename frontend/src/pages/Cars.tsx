import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Vehicle {
  plate: string;
  badge: string | null;
  userId: string | null;
  vehicleTypeId: number | null;
}

export default function Cars() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    plate: "",
    badge: "",
    userId: "",
    vehicleTypeId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "CRAI - Cars";
    loadVehicles();
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Cars" },
  ];

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setVehicles(result.data);
      } else if (Array.isArray(result)) {
        setVehicles(result);
      } else {
        notifications.error("Failed to load vehicles");
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
      notifications.error("Error loading vehicles");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.plate.trim()) {
      newErrors.plate = "Plate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingVehicle) {
        // Update vehicle
        const updateData: any = {};
        
        if (formData.badge) updateData.badge = formData.badge;
        if (formData.userId) updateData.userId = formData.userId;
        if (formData.vehicleTypeId) updateData.vehicleTypeId = parseInt(formData.vehicleTypeId);

        const response = await fetch(`${API_BASE_URL}/vehicle?plate=${encodeURIComponent(editingVehicle.plate)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (result.success || response.ok) {
          notifications.success("Vehicle updated successfully");
          loadVehicles();
          handleCloseDialog();
        } else {
          notifications.error(result.error || "Failed to update vehicle");
        }
      } else {
        // Create new vehicle
        const createData: any = {
          plate: formData.plate,
        };

        if (formData.badge) createData.badge = formData.badge;
        if (formData.userId) createData.userId = formData.userId;
        if (formData.vehicleTypeId) createData.vehicleTypeId = parseInt(formData.vehicleTypeId);

        const response = await fetch(`${API_BASE_URL}/vehicle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        });

        const result = await response.json();

        if (result.success || response.ok) {
          notifications.success("Vehicle created successfully");
          loadVehicles();
          handleCloseDialog();
        } else {
          notifications.error(result.error || "Failed to create vehicle");
        }
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      notifications.error("Error saving vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      badge: vehicle.badge || "",
      userId: vehicle.userId || "",
      vehicleTypeId: vehicle.vehicleTypeId?.toString() || "",
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (plate: string) => {
    if (!confirm(`Are you sure you want to delete vehicle "${plate}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vehicle?plate=${encodeURIComponent(plate)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success || response.ok) {
        notifications.success("Vehicle deleted successfully");
        loadVehicles();
      } else {
        notifications.error(result.error || "Failed to delete vehicle");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      notifications.error("Error deleting vehicle");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVehicle(null);
    setFormData({
      plate: "",
      badge: "",
      userId: "",
      vehicleTypeId: "",
    });
    setErrors({});
  };

  const handleOpenNewDialog = () => {
    setEditingVehicle(null);
    setFormData({
      plate: "",
      badge: "",
      userId: "",
      vehicleTypeId: "",
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vehicles Management</CardTitle>
            <CardDescription>Manage fleet vehicles</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Create New Vehicle"}</DialogTitle>
                <DialogDescription>
                  {editingVehicle ? "Update vehicle information" : "Fill in the details to create a new vehicle"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="plate" className="text-sm font-medium">
                      Plate <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="plate"
                      name="plate"
                      value={formData.plate}
                      onChange={handleChange}
                      disabled={!!editingVehicle || isSubmitting}
                      className={errors.plate ? "border-red-500" : ""}
                      placeholder="Enter plate number"
                    />
                    {errors.plate && (
                      <p className="text-xs text-red-500">{errors.plate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="badge" className="text-sm font-medium">
                      Badge
                    </label>
                    <Input
                      id="badge"
                      name="badge"
                      value={formData.badge}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter badge (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="userId" className="text-sm font-medium">
                      User ID
                    </label>
                    <Input
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter user ID (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="vehicleTypeId" className="text-sm font-medium">
                      Vehicle Type ID
                    </label>
                    <Input
                      id="vehicleTypeId"
                      name="vehicleTypeId"
                      type="number"
                      value={formData.vehicleTypeId}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter vehicle type ID (optional)"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingVehicle ? "Update" : "Create"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Vehicle Type ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => (
                    <TableRow key={vehicle.plate}>
                      <TableCell className="font-medium font-mono">{vehicle.plate}</TableCell>
                      <TableCell>{vehicle.badge || "-"}</TableCell>
                      <TableCell>{vehicle.userId || "-"}</TableCell>
                      <TableCell>{vehicle.vehicleTypeId || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(vehicle)}
                            title="Edit vehicle"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(vehicle.plate)}
                            title="Delete vehicle"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
