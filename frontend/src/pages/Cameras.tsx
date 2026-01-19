import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { useEffect, useState, useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import MapPicker from "@/components/MapPicker";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Camera {
  id: number;
  locationX: number;
  locationY: number;
}

export default function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notifications = useNotifications();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    locationX: "",
    locationY: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "CRAI - Cameras";
    loadCameras();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Small timeout to allow layout to settle
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      // Cleanup map when loading becomes true (component unmounts or re-renders loader)
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);

  const initializeMap = () => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([40.416775, -3.703790], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add click handler for creating new cameras
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setFormData({
        locationX: lat.toFixed(6),
        locationY: lng.toFixed(6),
      });
      setEditingCamera(null);
      setErrors({});
      setIsDialogOpen(true);
    });

    mapRef.current = map;
    
    // If we already have cameras, update markers now
    if (cameras.length > 0) {
      updateMapMarkers();
    }
  };

  useEffect(() => {
    // Only update markers if map exists. 
    // If map is not yet created, initializeMap will handle the initial marker update.
    if (mapRef.current && cameras.length > 0) {
      updateMapMarkers();
    }
  }, [cameras]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Cameras" },
  ];

  const updateMapMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add markers for each camera
    cameras.forEach(camera => {
      const marker = L.marker([camera.locationX, camera.locationY])
        .addTo(mapRef.current!);
      
      // Add popup with camera info
      const popupContent = `
        <div class="p-2">
          <p class="font-semibold mb-2">Camera #${camera.id}</p>
          <p class="text-xs text-gray-600">Lat: ${camera.locationX}</p>
          <p class="text-xs text-gray-600">Lng: ${camera.locationY}</p>
          <div class="flex gap-2 mt-2">
            <button id="edit-${camera.id}" class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
            <button id="delete-${camera.id}" class="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      // Add event listeners after popup opens
      marker.on('popupopen', () => {
        document.getElementById(`edit-${camera.id}`)?.addEventListener('click', () => {
          handleEdit(camera);
          marker.closePopup();
        });
        document.getElementById(`delete-${camera.id}`)?.addEventListener('click', () => {
          handleDelete(camera.id);
          marker.closePopup();
        });
      });

      markersRef.current.set(camera.id, marker);
    });

    // Fit bounds to show all markers
    if (cameras.length > 0) {
      const bounds = L.latLngBounds(cameras.map(c => [c.locationX, c.locationY]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const loadCameras = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cameras`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setCameras(result.data);
      } else if (Array.isArray(result)) {
        setCameras(result);
      } else {
        notifications.error("Failed to load cameras");
      }
    } catch (error) {
      console.error("Error loading cameras:", error);
      notifications.error("Error loading cameras");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.locationX.trim()) {
      newErrors.locationX = "Location X is required";
    } else if (isNaN(Number(formData.locationX))) {
      newErrors.locationX = "Location X must be a number";
    }

    if (!formData.locationY.trim()) {
      newErrors.locationY = "Location Y is required";
    } else if (isNaN(Number(formData.locationY))) {
      newErrors.locationY = "Location Y must be a number";
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

  const handleMapPositionChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      locationX: lat.toFixed(6),
      locationY: lng.toFixed(6),
    }));
    // Clear errors when position is selected from map
    setErrors((prev) => ({
      ...prev,
      locationX: "",
      locationY: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCamera) {
        // Update camera
        const updateData = {
          locationX: parseFloat(formData.locationX),
          locationY: parseFloat(formData.locationY),
        };

        const response = await fetch(`${API_BASE_URL}/camera?id=${editingCamera.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (result.success || response.ok) {
          notifications.success("Camera updated successfully");
          loadCameras();
          handleCloseDialog();
        } else {
          notifications.error(result.error || "Failed to update camera");
        }
      } else {
        // Create new camera
        const createData = {
          locationX: parseFloat(formData.locationX),
          locationY: parseFloat(formData.locationY),
        };

        const response = await fetch(`${API_BASE_URL}/camera`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        });

        const result = await response.json();

        if (result.success || response.ok) {
          notifications.success("Camera created successfully");
          loadCameras();
          handleCloseDialog();
        } else {
          notifications.error(result.error || "Failed to create camera");
        }
      }
    } catch (error) {
      console.error("Error saving camera:", error);
      notifications.error("Error saving camera");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (camera: Camera) => {
    setEditingCamera(camera);
    setFormData({
      locationX: camera.locationX.toString(),
      locationY: camera.locationY.toString(),
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete camera with ID ${id}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/camera?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success || response.ok) {
        notifications.success("Camera deleted successfully");
        loadCameras();
      } else {
        notifications.error(result.error || "Failed to delete camera");
      }
    } catch (error) {
      console.error("Error deleting camera:", error);
      notifications.error("Error deleting camera");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCamera(null);
    setFormData({
      locationX: "",
      locationY: "",
    });
    setErrors({});
  };

  const handleOpenNewDialog = () => {
    setEditingCamera(null);
    setFormData({
      locationX: "",
      locationY: "",
    });
    setErrors({});
  };

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Cameras Map</CardTitle>
            <CardDescription>
              View all cameras on the map. Click markers to edit/delete.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (open) {
              handleOpenNewDialog();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Camera
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-[1000]">
              <DialogHeader>
                <DialogTitle>{editingCamera ? "Edit Camera" : "Create New Camera"}</DialogTitle>
                <DialogDescription>
                  {editingCamera ? "Update camera location" : "Click on the map to select camera location"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Camera Location
                    </label>
                    {isDialogOpen && (
                      <MapPicker
                        position={[
                          parseFloat(formData.locationX) || 40.416775,
                          parseFloat(formData.locationY) || -3.703790
                        ]}
                        onPositionChange={handleMapPositionChange}
                      />
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Latitude: {formData.locationX || 'Click on map'}</span>
                      <span>Longitude: {formData.locationY || 'Click on map'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="locationX" className="text-sm font-medium">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="locationX"
                        name="locationX"
                        type="number"
                        step="0.000001"
                        value={formData.locationX}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={errors.locationX ? "border-red-500" : ""}
                        placeholder="e.g., 40.416775"
                      />
                      {errors.locationX && (
                        <p className="text-xs text-red-500">{errors.locationX}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="locationY" className="text-sm font-medium">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="locationY"
                        name="locationY"
                        type="number"
                        step="0.000001"
                        value={formData.locationY}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={errors.locationY ? "border-red-500" : ""}
                        placeholder="e.g., -3.703790"
                      />
                      {errors.locationY && (
                        <p className="text-xs text-red-500">{errors.locationY}</p>
                      )}
                    </div>
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
                      editingCamera ? "Update" : "Create"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="h-[calc(100%-5rem)] p-0">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div ref={containerRef} className="h-full w-full" />
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
