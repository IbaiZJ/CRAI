import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../database/config/firebase";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User logged in:", user);
      sessionStorage.setItem("email", email);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error in login:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Email or password invalid.");
      } else if (err.code === "auth/user-not-found") {
        setError("User not found.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Error logging in: " + err.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User logged in with Google:", user);
      sessionStorage.setItem("email", user.email || "");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error in login with Google:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google login window closed.");
      } else {
        setError("Error logging in with Google: " + err.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 mx-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="text-muted-foreground">
            Enter your credentials to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="you@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full cursor-pointer">
            Log In
          </Button>
        </form>
        <Button onClick={handleGoogleLogin} variant="outline" className="w-full cursor-pointer">
          Continue with Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
        <Link
          to="/"
          className="block text-center text-sm text-primary hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
