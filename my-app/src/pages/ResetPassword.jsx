import { useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, confirmPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reset failed");
      } else {
        setSuccess("Password reset successful. You can now log in.");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-6">
      <div className="w-full max-w-md rounded-3xl bg-[#0a0a0a] p-8 border border-white/10 shadow-2xl shadow-yellow-400/20">
        <h2 className="text-3xl font-bold text-white mb-3">
          Reset Password
        </h2>
        <p className="text-zinc-400 mb-6 text-sm">
          Enter a new password for your account.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-white"
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 text-white"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black hover:bg-yellow-300 transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {success && (
          <p className="mt-6 text-center text-sm">
            <Link to="/auth" className="text-yellow-400 hover:underline">
              Go to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
