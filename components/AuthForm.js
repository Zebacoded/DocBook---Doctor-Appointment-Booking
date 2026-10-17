"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      setLoading(false);
      if (error) return setError(error.message);
      if (data.session) {
        router.push("/");
      } else {
        setMessage(
          "Account created, but email confirmation is still required. Turn off 'Confirm email' in Supabase, or create the user in the dashboard."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      router.push("/");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 border rounded-lg p-6 shadow-sm">
      <h1 className="text-2xl font-bold mb-4">
        {isSignup ? "Create account" : "Login"}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {isSignup && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border rounded-md px-3 py-2"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded-md px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="border rounded-md px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-700 text-sm">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : isSignup ? "Sign up" : "Login"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        {isSignup ? "Already have an account? " : "No account yet? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-blue-600 underline"
        >
          {isSignup ? "Login" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}