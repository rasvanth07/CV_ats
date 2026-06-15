import { Link } from "wouter";
import { ArrowRight, CheckCircle, BarChart, Shield, Folder, Lightbulb } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-br from-primary to-blue-700 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-2xl tracking-tight">CVRanker</div>
          <div className="flex gap-6">
            <Link href="/admin/login" className="hover:bg-white/20 px-4 py-2 rounded-md transition-colors font-medium">
              Admin
            </Link>
            <Link href="/student" className="hover:bg-white/20 px-4 py-2 rounded-md transition-colors font-medium">
              Students Portal
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <header className="text-center mb-16 space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-700 pb-2">
              CVRanker AI
            </h1>
            <p className="text-xl text-slate-500 font-medium">
              Smart Resume Screening with Intelligent ATS Technology
            </p>
          </header>

          {/* Hero Section */}
          <section className="text-center max-w-4xl mx-auto mb-20 space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Welcome to the Future of Recruitment</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              CVRanker uses advanced ATS (Applicant Tracking System) technology to automatically screen and rank resumes, saving you hours of manual review time.
            </p>
          </section>

          {/* Features Grid */}
          <section className="mb-20">
            <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">Why Choose CVRanker?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<CheckCircle className="w-12 h-12 text-primary mb-4" />}
                title="Intelligent Skill Matching"
                description="Automatically matches candidate skills with job requirements using smart keyword detection and analysis."
              />
              <FeatureCard 
                icon={<ArrowRight className="w-12 h-12 text-primary mb-4" />}
                title="Instant Scoring"
                description="Get immediate ATS scores for every resume based on skill match percentage and keyword frequency."
              />
              <FeatureCard 
                icon={<BarChart className="w-12 h-12 text-primary mb-4" />}
                title="Smart Ranking"
                description="Resumes are automatically ranked from highest to lowest score, helping you identify top candidates instantly."
              />
              <FeatureCard 
                icon={<Shield className="w-12 h-12 text-primary mb-4" />}
                title="Secure & Private"
                description="All resume data is stored securely. Candidates don't see scores, ensuring unbiased recruitment process."
              />
              <FeatureCard 
                icon={<Folder className="w-12 h-12 text-primary mb-4" />}
                title="Easy Management"
                description="Organize resumes by job position, download shortlisted candidates, and manage multiple job posts effortlessly."
              />
              <FeatureCard 
                icon={<Lightbulb className="w-12 h-12 text-primary mb-4" />}
                title="Custom Keywords"
                description="Set hidden priority keywords to identify candidates with portfolios, GitHub profiles, or specific qualifications."
              />
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-white rounded-2xl shadow-lg p-12 mb-20 border border-slate-100">
            <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">How CVRanker Works</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <Step number="1" title="Admin Creates Job Post" desc="Add job title, description, required skills, and optional hidden keywords." />
              <div className="hidden md:block text-3xl text-primary font-bold">→</div>
              <Step number="2" title="Candidates Apply" desc="Students upload their resumes through the simple, user-friendly student portal." />
              <div className="hidden md:block text-3xl text-primary font-bold">→</div>
              <Step number="3" title="AI Analyzes Resumes" desc="Our ATS engine extracts text, matches skills and keywords, and calculates scores." />
              <div className="hidden md:block text-3xl text-primary font-bold">→</div>
              <Step number="4" title="Review & Shortlist" desc="Admin reviews ranked candidates and downloads shortlisted resumes." />
            </div>
          </section>

          {/* Portal Cards */}
          <section className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="card hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-2xl font-bold text-primary mb-4">For Recruiters</h3>
              <p className="text-slate-600 mb-6">Post jobs, review candidates, and download shortlisted resumes</p>
              <Link href="/admin/login" className="btn btn-primary">Admin Login</Link>
            </div>
            <div className="card hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-2xl font-bold text-primary mb-4">For Job Seekers</h3>
              <p className="text-slate-600 mb-6">Browse open positions and upload your resume to apply</p>
              <Link href="/student" className="btn btn-secondary">Apply Now</Link>
            </div>
          </section>

          {/* Stats */}
          <section className="flex flex-wrap justify-around gap-8 mb-12">
            <StatCard number="95%" label="Time Saved" />
            <StatCard number="100%" label="Accurate Scoring" />
            <StatCard number="∞" label="Resumes Supported" />
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500">
        <p>&copy; 2025 CVRanker AI. Streamlining recruitment with intelligent technology.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card text-center hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-center">{icon}</div>
      <h4 className="text-xl font-bold text-primary mb-3">{title}</h4>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex-1 text-center min-w-[200px]">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
        {number}
      </div>
      <h4 className="text-lg font-bold text-primary mb-2">{title}</h4>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className="flex-1 min-w-[200px] bg-gradient-to-br from-primary to-blue-700 rounded-xl p-8 text-center text-white shadow-lg">
      <div className="text-5xl font-bold mb-2">{number}</div>
      <div className="text-lg opacity-90">{label}</div>
    </div>
  );
}
