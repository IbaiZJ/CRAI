import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Esta es una ruta protegida. Solo usuarios autenticados pueden verla.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
