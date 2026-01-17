# Superhero Team Builder

A full-stack web application for browsing superheroes and building teams.

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL
- Frontend: Next.js, React, TypeScript, Tailwind CSS

## Getting Started

### Option 1: Docker (Recommended)

```bash
# Start all services
sudo docker-compose up --build
```

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## URLs

- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Frontend: http://localhost:3000