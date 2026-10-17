"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          DocBook
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {user ? (
            <>
              <Link href="/my-bookings" className="hover:text-blue-600">
                My Bookings
              </Link>
              <span className="text-gray-500 hidden sm:inline">{user.email}</span>
              <button
                onClick={logout}
                className="border border-blue-600 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">Login</Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}