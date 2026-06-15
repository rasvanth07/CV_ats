# Multi-stage Dockerfile to build React frontend and run Flask backend

# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Python Flask backend
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
RUN pip install --no-cache-dir Flask==3.0.0 Flask-CORS==4.0.0 PyPDF2==3.0.1 Werkzeug==3.0.1

# Copy Python backend and built React app
COPY app.py .
COPY CVRankerAILite ./CVRankerAILite
COPY --from=frontend-builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p CVRankerAILite/data CVRankerAILite/resumes

# Expose port 5000
EXPOSE 5000

# Run Flask app
CMD ["python", "app.py"]
