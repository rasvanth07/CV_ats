import { useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Lock } from "lucide-react";
import { authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authAPI.login(username, password);
      toast({ title: "Success", description: "Logged in successfully" });
      setLocation("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-primary">CVRanker</h1>
            <p className="text-slate-500">Admin Login</p>
          </div>
          <Link href="/" className="flex items-center text-slate-600 hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-md">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </header>

        <main className="max-w-md mx-auto">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">Admin Access</h2>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-8 text-center text-slate-500 text-sm bg-slate-50 py-3 rounded-md border border-slate-100">
              Demo credentials: <span className="font-mono font-bold text-slate-700">admin</span> / <span className="font-mono font-bold text-slate-700">1234</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
