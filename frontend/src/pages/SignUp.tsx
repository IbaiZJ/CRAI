import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  useEffect(() => {
    document.title = 'CRAI - Sign Up';
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const createUserProfile = async (userId: string, email: string, displayName?: string) => {
    await setDoc(doc(db, "users", userId), {
      email: email,
      displayName: displayName || name,
      role: "user", // Always assign 'user' role
      createdAt: new Date().toISOString(),
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("User registered:", user);
      sessionStorage.setItem("email", email);
      
      // Create user profile with 'user' role (without blocking navigation)
      createUserProfile(user.uid, email, name).catch((err) => {
        console.error("Error creating profile:", err);
      });
      
      // Navigate immediately without waiting
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error("Error in registration:", err);
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Error creating account: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("User registered with Google:", user);
      sessionStorage.setItem("email", user.email || "");
      
      // Create user profile with 'user' role (without blocking navigation)
      createUserProfile(user.uid, user.email || "", user.displayName || "").catch((err) => {
        console.error("Error creating profile:", err);
      });
      
      // Navigate immediately without waiting
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error("Error in registration with Google:", err);
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/popup-closed-by-user") {
        setError("Google registration window closed.");
      } else {
        setError("Error registering with Google: " + (error.message || "Unknown error"));
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">
            Complete the form to register
          </p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
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
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
        <Button onClick={handleGoogleSignUp} variant="outline" className="w-full">
          Continue with Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log In
          </Link>
        </p>
        <Link
          to="/"
          className="mt-8 block text-center text-sm text-primary hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
