import Layout, { type BreadcrumbItem } from "@/layouts/Layout";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import UsersTable, { type User } from "@/components/dataTable/UsersTable";
import { fetchApi, isUserArray, isAny } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "CRAI - Users Management";
    loadUsers();
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Users" },
  ];

  const loadUsers = async () => {
    try {
      const data = await fetchApi<User[]>(`${API_BASE_URL}/user`, undefined, isUserArray);
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      notifications.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!editingUser && !formData.password) {
      newErrors.password = "Password is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required";
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
      if (editingUser) {
        // Update user
        const updateData: any = {
          name: formData.name,
          surname: formData.surname,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }

        await fetchApi(`${API_BASE_URL}/user?username=${encodeURIComponent(editingUser.username)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }, isAny);

        notifications.success("User updated successfully");
        loadUsers();
        handleCloseDialog();
      } else {
        // Create new user
        await fetchApi(`${API_BASE_URL}/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }, isAny);

        notifications.success("User created successfully");
        loadUsers();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      notifications.error("Error saving user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      name: user.name,
      surname: user.surname,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await fetchApi(`${API_BASE_URL}/user?username=${encodeURIComponent(username)}`, { method: 'DELETE' }, isAny);
      notifications.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      notifications.error("Error deleting user");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      name: "",
      surname: "",
    });
    setErrors({});
  };

  const handleOpenNewDialog = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      name: "",
      surname: "",
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
            <p className="text-muted-foreground">Manage system users and permissions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
                <DialogDescription>
                  {editingUser ? "Update user information" : "Fill in the details to create a new user"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!!editingUser || isSubmitting}
                      className={errors.username ? "border-red-500" : ""}
                      placeholder="Enter username"
                    />
                    {errors.username && (
                      <p className="text-xs text-red-500">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password {editingUser && <span className="text-muted-foreground">(leave empty to keep current)</span>}
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={errors.password ? "border-red-500" : ""}
                      placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={errors.name ? "border-red-500" : ""}
                      placeholder="Enter name"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="surname" className="text-sm font-medium">
                      Surname
                    </label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={errors.surname ? "border-red-500" : ""}
                      placeholder="Enter surname"
                    />
                    {errors.surname && (
                      <p className="text-xs text-red-500">{errors.surname}</p>
                    )}
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
                      editingUser ? "Update" : "Create"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading users...</span>
            </div>
          ) : (
            <UsersTable 
              data={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
