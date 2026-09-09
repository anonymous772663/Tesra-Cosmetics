"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: authError } =
      mode === "sign_in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/");
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-16">
      <div className="w-full glass-card p-8">
        <h1 className="text-2xl text-berry-800 mb-1">
          {mode === "sign_in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-berry-800/60 mb-6">
          {mode === "sign_in" ? "Sign in to shop and track your orders." : "Join Tesra Cosmetics in seconds."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="pill-btn-primary w-full">
            {isSubmitting ? "Please wait..." : mode === "sign_in" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "sign_in" ? "sign_up" : "sign_in")}
          className="mt-5 text-sm text-berry-800/60 hover:text-berry-800 underline underline-offset-2"
        >
          {mode === "sign_in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
