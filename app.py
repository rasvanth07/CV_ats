from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import PyPDF2
import io
import zipfile

app = Flask(__name__, static_folder='dist/public', static_url_path='')
CORS(app, supports_credentials=True)
app.secret_key = os.environ.get('SESSION_SECRET', 'dev-secret-key-change-in-production')

DB_PATH = 'CVRankerAILite/data/db.json'
RESUME_FOLDER = 'CVRankerAILite/resumes'
ALLOWED_EXTENSIONS = {'pdf', 'txt'}

def load_db():
    if not os.path.exists(DB_PATH):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        save_db({
            "admins": [{"username": "admin", "password": "1234"}],
            "jobs": [],
            "resumes": []
        })
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

# API Routes
@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    db = load_db()
    for admin in db['admins']:
        if admin['username'] == username and admin['password'] == password:
            session['admin_logged_in'] = True
            session['username'] = username
            return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/auth/check', methods=['GET'])
def api_check_auth():
    return jsonify({'authenticated': session.get('admin_logged_in', False)})

@app.route('/api/jobs', methods=['GET'])
def api_get_jobs():
    db = load_db()
    # For students, sanitize hidden keywords
    if not session.get('admin_logged_in'):
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
        return jsonify(sanitized_jobs)
    return jsonify(db['jobs'])

@app.route('/api/jobs', methods=['POST'])
def api_create_job():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    db = load_db()
    
    skills = data.get('required_skills', [])
    keywords = data.get('hidden_keywords', [])
    
    if not skills:
        return jsonify({'error': 'At least one skill is required'}), 400
    
    job_id = f"JOB{len(db['jobs']) + 1:03d}"
    
    new_job = {
        'job_id': job_id,
        'title': data.get('title'),
        'description': data.get('description'),
        'required_skills': skills,
        'hidden_keywords': keywords,
        'created_at': datetime.now().isoformat()
    }
    
    db['jobs'].append(new_job)
    save_db(db)
    
    os.makedirs(os.path.join(RESUME_FOLDER, job_id), exist_ok=True)
    
    return jsonify(new_job)

@app.route('/api/jobs/<job_id>/resumes', methods=['GET'])
def api_get_job_resumes(job_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    db = load_db()
    job = next((j for j in db['jobs'] if j['job_id'] == job_id), None)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    job_resumes = [r for r in db['resumes'] if r['job_id'] == job_id]
    job_resumes.sort(key=lambda x: x.get('ats_score', {}).get('total_score', 0), reverse=True)
    
    return jsonify({
        'job': job,
        'resumes': job_resumes
    })

@app.route('/api/resumes/upload', methods=['POST'])
def api_upload_resume():
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

@app.route('/api/jobs/<job_id>/download-shortlisted', methods=['GET'])
def api_download_shortlisted(job_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    db = load_db()
    job_resumes = [r for r in db['resumes'] if r['job_id'] == job_id]
    shortlisted = [r for r in job_resumes if r.get('ats_score', {}).get('total_score', 0) >= 60]
    
    memory_file = io.BytesIO()
    
    with zipfile.ZipFile(memory_file, 'w') as zf:
        for resume in shortlisted:
            if os.path.exists(resume['file_path']):
                zf.write(resume['file_path'], os.path.basename(resume['file_path']))
    
    memory_file.seek(0)
    
    return send_from_directory(
        directory='.',
        path=memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f'shortlisted_{job_id}.zip'
    )

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    os.makedirs('CVRankerAILite/data', exist_ok=True)
    os.makedirs('CVRankerAILite/resumes', exist_ok=True)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
