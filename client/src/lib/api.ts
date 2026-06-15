// API client for Flask backend

const API_BASE = '/api';

export interface Job {
  job_id: string;
  title: string;
  description: string;
  required_skills: string[];
  hidden_keywords?: string[];
  created_at: string;
}

export interface Resume {
  resume_id: string;
  job_id: string;
  student_name: string;
  student_email: string;
  file_path: string;
  uploaded_at: string;
  ats_score: {
    skill_score: number;
    keyword_count: number;
    hidden_keyword_bonus: number;
    matched_hidden_keywords: string[];
    total_score: number;
    matched_skills: string[];
  };
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  logout: async () => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return res.json();
  },

  checkAuth: async () => {
    const res = await fetch(`${API_BASE}/auth/check`, {
      credentials: 'include'
    });
    return res.json();
  }
};

// Jobs API
export const jobsAPI = {
  getAll: async (): Promise<Job[]> => {
    const res = await fetch(`${API_BASE}/jobs`, {
      credentials: 'include'
    });
    return res.json();
  },

  create: async (jobData: Partial<Job>): Promise<Job> => {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(jobData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create job');
    }
    return res.json();
  },

  getResumes: async (jobId: string): Promise<{ job: Job; resumes: Resume[] }> => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/resumes`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch resumes');
    return res.json();
  }
};

// Resumes API
export const resumesAPI = {
  upload: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Upload failed');
    }
    return res.json();
  }
};
