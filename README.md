# Superhero Team Builder

Web app for browsing superheroes, building teams, and comparing them.

## Tech Stack

- Backend: FastAPI + PostgreSQL + SQLAlchemy
- Frontend: Next.js 16 + TypeScript + Tailwind CSS

## Quick Start

### Using Docker (Recommended)

1. Clone the repo
2. Create `backend/.env` and `frontend/.env` (see below)
3. Run `docker-compose up --build`
4. **Note:** The project uses a deployed Neon PostgreSQL database, and the database URL is already provided in the .env file. No migrations or seeders are required.
5. Open http://localhost:3000

### Local Setup

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file (see below)

# If using local PostgreSQL database:
alembic upgrade head
python3 run_seeders.py

uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install

# Create .env file (see below)

npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env` file:

```env
DATABASE_URL=postgresql://neondb_owner:npg_92uzNibBtprZ@ep-raspy-resonance-ahxwap49-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SUPERHERO_API_TOKEN=29a93509d9431c0cb02a12f9af7cd69a
SECRET_KEY=XZz4q5t6i1tLtZuD6SokHMLzVKeuOPB2d7KwrOm0CT1cQeBuFCT6ojZCx8jsFrcU
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_BASE_URL=http://localhost:3000
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=kushmistry16@gmail.com
SMTP_PASSWORD=tvnewpxtnolvwarb
FROM_EMAIL=kushmistry16@gmail.com
SMTP_USE_TLS=true
```

Note: If using a cloud database (like Neon DB), the database is already deployed. For local PostgreSQL, you need to run migrations and seeders.

### Frontend (`frontend/.env`)

Create `frontend/.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Default Login

After seeding:
- Email: `superhero.admin@mailinator.com`
- Password: `admin123`

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Features

- User authentication (register, login, password reset)
- Browse superheroes with search and filters
- Save favorites
- Create teams (2-5 members)
- Get team recommendations (balanced, power-based, random)
- Compare teams and predict winners

## Database

**For cloud databases (Neon DB, etc.):** Database is already deployed, no migrations/seeding needed.

**For local PostgreSQL:** Run migrations and seeders:

```bash
# Migrations
alembic upgrade head

# Seed data
python3 run_seeders.py              # All data
python3 run_seeders.py superhero    # Just superheroes
python3 run_seeders.py user         # Just users
```

## Notes

- Backend uses FastAPI with auto-generated docs at `/docs`
- JWT tokens stored in localStorage
- Team comparison uses weighted scoring (total power 40%, average 20%, strength 15%, combat 15%, intelligence 10%)
