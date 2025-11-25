import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    // Aquí harías el registro real
    localStorage.setItem("authToken", "your-token-here");
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Crear Cuenta</h1>
          <p className="text-muted-foreground">
            Completa el formulario para registrarte
          </p>
        </div>
        <div className="space-y-4">
          <Button onClick={handleSignUp} className="w-full">
            Registrarse
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
          <Link
            to="/"
            className="block text-center text-sm text-primary hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
