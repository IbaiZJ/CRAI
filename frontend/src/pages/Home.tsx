import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Bienvenido</h1>
      <p className="text-muted-foreground">Esta es la página de inicio pública</p>
      <div className="flex gap-4">
        <Link to="/login" className="text-primary hover:underline">
          Iniciar Sesión
        </Link>
        <Link to="/signup" className="text-primary hover:underline">
          Registrarse
        </Link>
        <Link to="/dashboard" className="text-primary hover:underline">
          Dashboard (Protegido)
        </Link>
      </div>
    </div>
  );
}
