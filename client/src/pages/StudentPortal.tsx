import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Upload, CheckCircle, Briefcase } from "lucide-react";
import { jobsAPI, resumesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StudentPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs-student'],
    queryFn: jobsAPI.getAll
  });

  const uploadMutation = useMutation({
    mutationFn: resumesAPI.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-resumes'] });
      toast({ title: "Success!", description: "Resume uploaded successfully" });
      setSubmitted(true);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedJobId) return;

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_id', selectedJobId);
    formData.append('student_name', name);
    formData.append('student_email', email);

    uploadMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-8">
            Thank you, {name}. Your resume has been successfully uploaded and screened.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setSubmitted(false);
                setName("");
                setEmail("");
                setFile(null);
                setSelectedJobId("");
              }}
              className="btn btn-primary"
            >
              Submit Another Application
            </button>
            <Link href="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">CVRanker</h1>
            <p className="text-slate-500">Student Resume Upload Portal</p>
          </div>
          <Link href="/" className="flex items-center text-slate-600 hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-md border border-transparent hover:border-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </header>

        <main className="grid lg:grid-cols-2 gap-12">
          <div className="card h-fit">
            <h2 className="text-2xl font-bold text-primary mb-6">Apply for a Position</h2>
            <p className="text-slate-600 mb-8">Upload your resume to apply for available positions</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                  disabled={uploadMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                  disabled={uploadMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Position *</label>
                <div className="relative">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="input-field appearance-none"
                    required
                    disabled={uploadMutation.isPending}
                  >
                    <option value="">-- Choose a Job --</option>
                    {jobs.map((job) => (
                      <option key={job.job_id} value={job.job_id}>
                        {job.title} ({job.job_id})
                      </option>
                    ))}
                  </select>
                  <Briefcase className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Resume * (PDF or TXT)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition-colors bg-slate-50 cursor-pointer relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    accept=".pdf,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                    disabled={uploadMutation.isPending}
                  />
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-slate-500">PDF or TXT (MAX. 5MB)</p>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block py-3 text-lg"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading & Screening..." : "Upload Resume"}
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6" /> Available Positions
            </h3>
            
            {jobs.length === 0 ? (
              <div className="bg-amber-50 text-amber-800 p-6 rounded-lg border border-amber-200">
                No job positions are currently available. Please check back later!
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <div key={job.job_id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary">
                    <h4 className="text-lg font-bold text-primary mb-2">{job.title}</h4>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">{job.description}</p>
                    <div>
                      <strong className="text-sm text-slate-800 block mb-2">Required Skills:</strong>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
