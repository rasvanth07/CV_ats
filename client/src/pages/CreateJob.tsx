import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Lock, Save } from "lucide-react";
import { jobsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CreateJob() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [keywords, setKeywords] = useState("");
  const [error, setError] = useState("");

  const createJobMutation = useMutation({
    mutationFn: jobsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({ title: "Success", description: "Job created successfully" });
      setLocation("/admin/dashboard");
    },
    onError: (err: Error) => {
      setError(err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const skillsList = skills.split(",").map(s => s.trim()).filter(Boolean);
    const keywordsList = keywords.split(",").map(k => k.trim()).filter(Boolean);
    
    if (skillsList.length === 0) {
      setError("At least one skill is required");
      return;
    }

    createJobMutation.mutate({
      title,
      description,
      required_skills: skillsList,
      hidden_keywords: keywordsList
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">CVRanker</h1>
            <p className="text-slate-500">Create New Job Posting</p>
          </div>
          <Link href="/admin/dashboard" className="flex items-center text-slate-600 hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-md border border-transparent hover:border-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </header>

        <main className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold text-primary mb-6">Job Details</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Full Stack Developer"
                  className="input-field"
                  required
                  disabled={createJobMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={5}
                  className="input-field min-h-[120px]"
                  required
                  disabled={createJobMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Required Skills * (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., Python, JavaScript, React, Node.js, SQL"
                  className="input-field"
                  required
                  disabled={createJobMutation.isPending}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Separate each skill with a comma. These will be visible to students.
                </p>
              </div>

              <div className="bg-amber-50 p-6 rounded-lg border-2 border-dashed border-amber-400">
                <label className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                  <Lock className="w-4 h-4" /> Hidden Priority Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., portfolio, github, linkedin, project, certification"
                  className="w-full px-3 py-2.5 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  disabled={createJobMutation.isPending}
                />
                <div className="mt-3 text-xs text-amber-800 space-y-1">
                  <p><strong>Secret Scoring Boost:</strong> Add keywords like "portfolio", "github" to prioritize candidates.</p>
                  <p><strong>Students will NOT see these keywords.</strong></p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn btn-primary" disabled={createJobMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" /> {createJobMutation.isPending ? "Creating..." : "Create Job Post"}
                </button>
                <Link href="/admin/dashboard" className="btn btn-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
