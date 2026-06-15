import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, LogOut, Briefcase, Users } from "lucide-react";
import { jobsAPI, authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsAPI.getAll
  });

  const handleLogout = async () => {
    await authAPI.logout();
    toast({ title: "Logged out successfully" });
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-12 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">CVRanker Dashboard</h1>
            <p className="text-slate-500 font-medium">Admin Panel</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/create-job" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Create Job
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </header>

        <main>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" /> Job Postings
          </h2>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-100">
              <p className="text-slate-500 mb-6 text-lg">No job postings yet. Create your first job to get started!</p>
              <Link href="/admin/create-job" className="btn btn-primary">
                Create Job Post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.job_id} className="card hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-primary group-hover:text-blue-700 transition-colors">{job.title}</h3>
                    <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded-md border border-slate-200">
                      {job.job_id}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 mb-6 line-clamp-3 text-sm leading-relaxed min-h-[60px]">
                    {job.description}
                  </p>
                  
                  <div className="mb-6">
                    <strong className="text-sm text-slate-800 block mb-2">Required Skills:</strong>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                          {skill}
                        </span>
                      ))}
                      {job.required_skills.length > 5 && (
                        <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                          +{job.required_skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <Link href={`/admin/job/${job.job_id}`} className="btn btn-primary w-full justify-center">
                      <Users className="w-4 h-4 mr-2" /> View Resumes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
