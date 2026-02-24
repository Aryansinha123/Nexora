"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    // 🔥 Important: force full navigation so middleware re-checks cookie
    router.push("/admin/dashboard");
router.refresh();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <form
        onSubmit={handleLogin}
        className="bg-[#111827] p-8 rounded-xl shadow-lg shadow-black/30 w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">
          Admin Login
        </h2>

        {error && (
          <p className="text-red-400 mb-4 text-sm">{error}</p>
        )}

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full p-3 bg-[#0f172a] border border-gray-800 rounded mb-4 text-gray-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-[#0f172a] border border-gray-800 rounded mb-6 text-gray-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-500 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}