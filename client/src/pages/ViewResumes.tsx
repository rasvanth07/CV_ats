import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Download, FileText, CheckCircle, XCircle } from "lucide-react";
import { jobsAPI } from "@/lib/api";

export default function ViewResumes() {
  const [, params] = useRoute("/admin/job/:jobId");
  const jobId = params?.jobId;

  const { data, isLoading } = useQuery({
    queryKey: ['job-resumes', jobId],
    queryFn: () => jobsAPI.getResumes(jobId!),
    enabled: !!jobId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Job Not Found</h2>
          <Link href="/admin/dashboard" className="btn btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { job, resumes } = data;
  const shortlistedCount = resumes.filter(r => r.ats_score.total_score >= 60).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{job.title}</h1>
              <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded-md border border-slate-200">
                {job.job_id}
              </span>
            </div>
            <Link href="/admin/dashboard" className="flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
              <ArrowLeft className="w-3 h-3 mr-1" /> Back to Dashboard
            </Link>
          </div>
          <div className="flex gap-4">
            {shortlistedCount > 0 && (
              <a href={`/api/jobs/${job.job_id}/download-shortlisted`} className="btn btn-primary">
                <Download className="w-4 h-4 mr-2" /> Download Shortlisted ({shortlistedCount})
              </a>
            )}
          </div>
        </header>

        <main className="space-y-8">
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-3">Job Description</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">{job.description}</p>
            
            <div className="mb-4">
              <strong className="text-sm text-slate-800 block mb-2">Required Skills:</strong>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {job.hidden_keywords && job.hidden_keywords.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border-2 border-dashed border-amber-400/50 mt-4">
                <strong className="text-amber-800 text-sm block mb-2 flex items-center gap-2">
                  <span className="text-lg">🔒</span> Hidden Priority Keywords (Not visible to students):
                </strong>
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.hidden_keywords.map((keyword, idx) => (
                    <span key={idx} className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
                      {keyword}
                    </span>
                  ))}
                </div>
                <small className="text-amber-700 text-xs block">
                  Each keyword match gives +2 bonus per occurrence
                </small>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Submitted Resumes ({resumes.length})
            </h2>

            {resumes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-100 text-slate-500">
                <p>No resumes submitted yet for this position.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Rank</th>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Total Score</th>
                        <th className="px-6 py-4">Skill Match %</th>
                        <th className="px-6 py-4">Keywords</th>
                        <th className="px-6 py-4">🔒 Bonus</th>
                        <th className="px-6 py-4">Matched Skills</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resumes.map((resume, idx) => {
                        const isShortlisted = resume.ats_score.total_score >= 60;
                        return (
                          <tr key={resume.resume_id} className={`hover:bg-slate-50 transition-colors ${isShortlisted ? 'bg-green-50/30' : ''}`}>
                            <td className="px-6 py-4 font-bold text-primary">#{idx + 1}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{resume.student_name}</div>
                              <div className="text-slate-500 text-xs">{resume.student_email}</div>
                              <div className="text-slate-400 text-xs mt-1">{new Date(resume.uploaded_at).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${isShortlisted ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {resume.ats_score.total_score}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">
                              {resume.ats_score.skill_score}%
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {resume.ats_score.keyword_count}
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-amber-50 text-amber-800 px-3 py-2 rounded-md border border-amber-100 font-medium inline-block min-w-[60px] text-center">
                                +{resume.ats_score.hidden_keyword_bonus}
                              </div>
                              {resume.ats_score.matched_hidden_keywords.length > 0 && (
                                <div className="text-xs text-amber-700 mt-1 max-w-[150px] leading-tight">
                                  ({resume.ats_score.matched_hidden_keywords.join(', ')})
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {resume.ats_score.matched_skills.length > 0 ? (
                                  resume.ats_score.matched_skills.map((skill, i) => (
                                    <span key={i} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] border border-green-100">
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-400 italic text-xs">None</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {isShortlisted ? (
                                <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Shortlisted
                                </span>
                              ) : (
                                <span className="inline-flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold border border-red-100">
                                  <XCircle className="w-3 h-3 mr-1" /> Rejected
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
