"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/addUser`,
        { username, email, password }
      );

      // Redirect to login after success
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.error || "Signup failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-6">
  <div className="bg-white p-6 sm:p-8 shadow-lg rounded-lg w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {error && (
          <p className="mb-4 text-red-600 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Username</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="BigTrax01"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="•••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/")}
            className="text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
