# CVRanker - ATS Resume Screening System

## Overview
CVRanker is an AI-Lite Applicant Tracking System (ATS) for resume screening. It provides automated skill matching and scoring for uploaded resumes, helping recruiters efficiently identify qualified candidates.

**Technology Stack:**
- Backend: Flask (Python)
- Frontend: HTML, CSS, Vanilla JavaScript
- Database: JSON file-based storage
- Resume Parsing: PyPDF2

## Project Structure
```
├── app.py                  # Main Flask application with all routes
├── data/
│   └── db.json            # JSON database (admins, jobs, resumes)
├── resumes/               # Uploaded resume files (organized by job_id)
├── static/
│   ├── css/
│   │   └── style.css      # Complete styling for all pages
│   └── js/
│       └── student.js     # Student portal upload functionality
└── templates/
    ├── index.html         # Landing page
    ├── admin_login.html   # Admin authentication
    ├── admin_dashboard.html # Job management dashboard
    ├── create_job.html    # Job posting creation
    ├── view_resumes.html  # Resume viewing and scoring
    └── student_portal.html # Resume upload interface
```

## Features

### Homepage
1. **Professional Landing Page**: Modern hero section with navigation
2. **Sticky Navbar**: Quick access to Admin and Students Portal
3. **Feature Showcase**: Highlights automated screening, accuracy, and efficiency
4. **How It Works**: Step-by-step visual guide for recruiters
5. **Statistics Section**: Platform capabilities and impact metrics

### Admin Panel
1. **Authentication**: Login system with credentials stored in JSON
2. **Job Management**: Create job posts with title, description, required skills, and hidden keywords
3. **Hidden Keywords**: Secret evaluation criteria (portfolio, github, linkedin, etc.) invisible to students
4. **Resume Review**: View all submitted resumes with ATS scores including hidden keyword bonuses
5. **Sorting**: Resumes automatically sorted by total score
6. **Download**: Export shortlisted candidates (score ≥ 60) as ZIP
7. **Visual Indicators**: Color-coded skill tags (green) vs hidden keyword tags (yellow with dashed border)

### Student Portal
1. **Job Selection**: Dropdown of available positions
2. **Resume Upload**: Support for PDF and TXT formats
3. **Submission Confirmation**: Professional thank you message after upload
4. **Privacy**: Scores and hidden keywords are completely hidden from students - only visible to admins
5. **Sanitized Data**: Students see only job title, description, and required skills

### ATS Scoring Engine
**Algorithm:**
- **Skill Score**: (matched_skills / total_required_skills) × 100
- **Keyword Count**: Number of times required skills appear in resume
- **Hidden Keyword Bonus**: +2 points per occurrence of hidden keywords
- **Total Score**: Skill Score + Keyword Count + Hidden Keyword Bonus

**Process:**
1. Extract text from PDF/TXT file
2. Convert to lowercase for case-insensitive matching
3. Search for each required skill in resume text
4. Search for each hidden keyword in resume text (invisible to students)
5. Calculate scores and identify matched skills/keywords
6. Store complete results in database (admin-only access)

**Security:**
- Hidden keywords never exposed in student-facing API endpoints
- Job data sanitized before sending to student portal
- Upload response contains no scoring information

## Default Credentials
- **Username**: admin
- **Password**: 1234

## Database Schema
```json
{
  "admins": [
    {"username": "admin", "password": "1234"}
  ],
  "jobs": [
    {
      "job_id": "JOB001",
      "title": "Full Stack Developer",
      "description": "...",
      "required_skills": ["Python", "React", "SQL"],
      "hidden_keywords": ["portfolio", "github", "linkedin"],
      "created_at": "2025-11-22T10:15:00"
    }
  ],
  "resumes": [
    {
      "resume_id": "RES0001",
      "job_id": "JOB001",
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "file_path": "resumes/JOB001/John_Doe_20251122_101500.pdf",
      "uploaded_at": "2025-11-22T10:15:00",
      "ats_score": {
        "skill_score": 66.67,
        "keyword_count": 5,
        "hidden_keyword_bonus": 6,
        "total_score": 77.67,
        "matched_skills": ["Python", "React"],
        "matched_hidden_keywords": ["portfolio", "github", "github"]
      }
    }
  ]
}
```

## Development
- Server runs on: `http://0.0.0.0:5000`
- Debug mode: Enabled (disable for production)
- Session secret: Stored in SESSION_SECRET environment variable

## Recent Changes
- 2025-11-22: Enhanced homepage and hidden keywords feature
  - Added professional landing page with sticky navbar
  - Implemented hidden keywords feature for strategic evaluation
  - Enhanced scoring algorithm with +2 bonus per hidden keyword match
  - Added data sanitization to protect hidden keywords from student view
  - Updated admin dashboard with visual distinction between skills and keywords
  - Fixed security vulnerabilities preventing hidden keyword leakage
  
- 2025-11-22: Initial project creation
  - Implemented Flask backend with all routes
  - Created admin authentication and job management
  - Built student resume upload portal
  - Developed ATS scoring algorithm
  - Designed responsive UI with modern styling
  - Added file upload handling and validation
  - Implemented resume download functionality

## User Preferences
None specified yet.

## Notes
- Resumes are stored in `/resumes/{job_id}/` folders
- Shortlist threshold is 60% total score
- Supports PDF and TXT resume formats
- All text matching is case-insensitive
- Skills should be comma-separated when creating jobs
