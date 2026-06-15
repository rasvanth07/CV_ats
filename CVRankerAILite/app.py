from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_file
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import PyPDF2
import io
import zipfile
import re

app = Flask(__name__)
app.secret_key = os.environ.get('SESSION_SECRET', 'dev-secret-key-change-in-production')

DB_PATH = 'data/db.json'
RESUME_FOLDER = 'resumes'
ALLOWED_EXTENSIONS = {'pdf', 'txt'}

def load_db():
    with open(DB_PATH, 'r') as f:
        return json.load(f)

def save_db(data):
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ''
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text.lower()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_text_from_txt(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().lower()
    except Exception as e:
        print(f"Error reading text file: {e}")
        return ""

def calculate_ats_score(resume_text, required_skills, hidden_keywords=None):
    resume_text = resume_text.lower()
    matched_skills = []
    skill_score = 0
    
    for skill in required_skills:
        skill_lower = skill.lower()
        if skill_lower in resume_text:
            matched_skills.append(skill)
    
    if len(required_skills) > 0:
        skill_score = (len(matched_skills) / len(required_skills)) * 100
    
    keyword_count = 0
    for skill in required_skills:
        keyword_count += resume_text.count(skill.lower())
    
    matched_hidden_keywords = []
    hidden_keyword_bonus = 0
    
    if hidden_keywords:
        for keyword in hidden_keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in resume_text:
                matched_hidden_keywords.append(keyword)
                hidden_keyword_bonus += resume_text.count(keyword_lower) * 2
    
    total_score = skill_score + keyword_count + hidden_keyword_bonus
    
    return {
        'skill_score': round(skill_score, 2),
        'keyword_count': keyword_count,
        'hidden_keyword_bonus': hidden_keyword_bonus,
        'matched_hidden_keywords': matched_hidden_keywords,
        'total_score': round(total_score, 2),
        'matched_skills': matched_skills
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        db = load_db()
        for admin in db['admins']:
            if admin['username'] == username and admin['password'] == password:
                session['admin_logged_in'] = True
                session['username'] = username
                return redirect(url_for('admin_dashboard'))
        
        return render_template('admin_login.html', error='Invalid credentials')
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    db = load_db()
    return render_template('admin_dashboard.html', jobs=db['jobs'])

@app.route('/admin/create-job', methods=['GET', 'POST'])
def create_job():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        db = load_db()
        
        skills_input = request.form.get('skills', '')
        skills = [s.strip() for s in skills_input.split(',') if s.strip()]
        
        if not skills:
            return render_template('create_job.html', error='At least one skill is required')
        
        keywords_input = request.form.get('keywords', '')
        keywords = [k.strip() for k in keywords_input.split(',') if k.strip()]
        
        job_id = f"JOB{len(db['jobs']) + 1:03d}"
        
        new_job = {
            'job_id': job_id,
            'title': request.form.get('title'),
            'description': request.form.get('description'),
            'required_skills': skills,
            'hidden_keywords': keywords,
            'created_at': datetime.now().isoformat()
        }
        
        db['jobs'].append(new_job)
        save_db(db)
        
        os.makedirs(os.path.join(RESUME_FOLDER, job_id), exist_ok=True)
        
        return redirect(url_for('admin_dashboard'))
    
    return render_template('create_job.html')

@app.route('/admin/job/<job_id>')
def view_job_resumes(job_id):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    db = load_db()
    job = next((j for j in db['jobs'] if j['job_id'] == job_id), None)
    
    if not job:
        return "Job not found", 404
    
    job_resumes = [r for r in db['resumes'] if r['job_id'] == job_id]
    job_resumes.sort(key=lambda x: x.get('ats_score', {}).get('total_score', 0), reverse=True)
    
    return render_template('view_resumes.html', job=job, resumes=job_resumes)

@app.route('/admin/download-shortlisted/<job_id>')
def download_shortlisted(job_id):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    db = load_db()
    job_resumes = [r for r in db['resumes'] if r['job_id'] == job_id]
    shortlisted = [r for r in job_resumes if r.get('ats_score', {}).get('total_score', 0) >= 60]
    
    memory_file = io.BytesIO()
    
    with zipfile.ZipFile(memory_file, 'w') as zf:
        for resume in shortlisted:
            if os.path.exists(resume['file_path']):
                zf.write(resume['file_path'], os.path.basename(resume['file_path']))
    
    memory_file.seek(0)
    
    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f'shortlisted_{job_id}.zip'
    )

@app.route('/student')
def student_portal():
    db = load_db()
    sanitized_jobs = []
    for job in db['jobs']:
        sanitized_job = {
            'job_id': job['job_id'],
            'title': job['title'],
            'description': job['description'],
            'required_skills': job['required_skills'],
            'created_at': job.get('created_at', '')
        }
        sanitized_jobs.append(sanitized_job)
    return render_template('student_portal.html', jobs=sanitized_jobs)

@app.route('/student/upload', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['resume']
    job_id = request.form.get('job_id', '')
    student_name = request.form.get('student_name', '')
    student_email = request.form.get('student_email', '')
    
    if not job_id or not student_name or not student_email:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not file.filename or file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF and TXT files are allowed'}), 400
    
    db = load_db()
    job = next((j for j in db['jobs'] if j['job_id'] == job_id), None)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower()
    new_filename = f"{student_name.replace(' ', '_')}_{timestamp}.{ext}"
    
    job_folder = os.path.join(RESUME_FOLDER, job_id)
    os.makedirs(job_folder, exist_ok=True)
    
    file_path = os.path.join(job_folder, new_filename)
    file.save(file_path)
    
    if ext == 'pdf':
        resume_text = extract_text_from_pdf(file_path)
    else:
        resume_text = extract_text_from_txt(file_path)
    
    hidden_keywords = job.get('hidden_keywords', [])
    ats_score = calculate_ats_score(resume_text, job['required_skills'], hidden_keywords)
    
    resume_record = {
        'resume_id': f"RES{len(db['resumes']) + 1:04d}",
        'job_id': job_id,
        'student_name': student_name,
        'student_email': student_email,
        'file_path': file_path,
        'uploaded_at': datetime.now().isoformat(),
        'ats_score': ats_score
    }
    
    db['resumes'].append(resume_record)
    save_db(db)
    
    return jsonify({
        'success': True,
        'message': 'Resume uploaded successfully!'
    })

if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    os.makedirs('resumes', exist_ok=True)
    
    if not os.path.exists(DB_PATH):
        save_db({
            "admins": [{"username": "admin", "password": "1234"}],
            "jobs": [],
            "resumes": []
        })
    
    app.run(host='0.0.0.0', port=5000, debug=True)
