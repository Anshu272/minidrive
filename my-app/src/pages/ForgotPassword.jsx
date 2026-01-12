import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md rounded-3xl bg-[#0a0a0a] p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-4">
          Forgot Password
        </h2>
        <p className="text-zinc-400 mb-6 text-sm">
          Enter your email and we’ll send you a password reset link.
        </p>

        {message && (
          <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 py-3 font-bold text-black hover:bg-yellow-300 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-500 text-center">
          Remembered your password?{" "}
          <Link to="/auth" className="text-yellow-400 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
