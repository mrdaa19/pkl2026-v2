"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Kredensial admin tidak valid.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4">
          Kembali ke Portal Siswa
        </Link>

        <div className="border-t-2 border-zinc-900 pt-4">
          <h1 className="text-2xl font-bold text-zinc-900">Login Admin PKL</h1>
          <p className="text-xs text-zinc-500 mt-1">Masuk untuk mengelola rekap berkas 12 DKV.</p>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-800 bg-red-50 border-l-4 border-red-700 p-3">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-medium text-zinc-700 mb-1">
              Email Admin
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-editorial"
            />
          </div>
          <div>
            <label htmlFor="admin-pass" className="block text-xs font-medium text-zinc-700 mb-1">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-editorial"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-900 hover:bg-amber-800 text-stone-50 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
          >
            {loading ? "Memverifikasi..." : "Masuk Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}