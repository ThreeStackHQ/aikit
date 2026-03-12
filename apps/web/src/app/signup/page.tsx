"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, workspaceName }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Something went wrong");
    } else {
      router.push("/login?signup=1");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0e1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create your AIKit account</h1>
          <p className="text-gray-400 mt-2">Free — 100 requests/month, no credit card</p>
        </div>
        <div className="bg-[#1a1828] border border-[#2d2b45] rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded p-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0f0e1a] border border-[#2d2b45] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Workspace name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="My Startup"
                required
                className="w-full bg-[#0f0e1a] border border-[#2d2b45] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0f0e1a] border border-[#2d2b45] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-[#0f0e1a] border border-[#2d2b45] rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Creating account..." : "Start for free"}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[#7c3aed] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
