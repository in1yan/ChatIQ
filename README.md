# ChatIQ

ChatIQ is a full-stack AI-powered chat application with support for Telegram and WhatsApp integrations. Built with Next.js on the frontend and FastAPI on the backend, it features intelligent message handling, vector search capabilities, and OAuth authentication.

## Features

- 🤖 AI-powered chat using Groq API
- 💬 Telegram Bot integration
- 📱 WhatsApp integration (WAHA)
- 🔍 Vector search with ChromaDB
- 🔐 OAuth authentication with Supabase
- 📊 Message persistence and analytics
- 🎨 Modern UI with Next.js and Tailwind CSS

## Project Structure

```
chatiq/
├── client/          # Next.js frontend application
│   ├── app/         # Next.js App Router pages
│   ├── public/      # Static assets
│   └── package.json # Frontend dependencies
└── server/          # FastAPI backend application
    ├── app/         # Application code
    │   ├── api/     # API routes
    │   ├── core/    # Core configuration
    │   ├── db/      # Database models
    │   ├── models/  # Data models
    │   ├── schemas/ # Pydantic schemas
    │   └── services/# External service integrations
    ├── main.py      # FastAPI entry point
    └── pyproject.toml # Backend dependencies
```

## Prerequisites

- **Node.js** 20+ (for frontend)
- **Python** 3.12+ (for backend)
- **PostgreSQL** database
- **pnpm** (recommended) or npm
- **uv** (recommended) or pip for Python package management

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chatiq
```

### 2. Backend Setup (FastAPI)

Navigate to the server directory:

```bash
cd server
```

Install dependencies using uv (recommended):

```bash
uv sync
```

Or using pip:

```bash
pip install -e .
```

Create a `.env` file in the `server/` directory with the following configuration:

```env
# Application Settings
APP_NAME=ChatIQ
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:3000

# AI Services
GROQ_API_KEY=your_groq_api_key

# ChromaDB Vector Store
CHROMA_PERSIST_DIR=.chroma
CHROMA_COLLECTION_NAME=chatiq_messages

# WhatsApp (WAHA)
WAHA_BASE_URL=http://localhost:3000/api
WAHA_API_KEY=your_waha_api_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=your_webhook_url
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_STORAGE_BUCKET=posters

# Database Configuration
DATABASE_URI=postgresql://user:password@localhost:5432/chatiq

# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OAuth Configuration
OAUTH_REDIRECT_URL=http://localhost:8000/api/v1/auth/oauth/callback
OAUTH_ENABLED_PROVIDERS=google

# CORS Configuration
CORS_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=True
```

Run database migrations:

```bash
alembic upgrade head
```

### 3. Frontend Setup (Next.js)

Navigate to the client directory:

```bash
cd ../client
```

Install dependencies:

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

Create a `.env.local` file in the `client/` directory (if needed):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Start the Backend Server

From the `server/` directory:

```bash
# Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- API Documentation (Swagger): http://localhost:8000/api/docs
- API Documentation (ReDoc): http://localhost:8000/api/redoc

### Start the Frontend Development Server

From the `client/` directory:

```bash
pnpm dev
```

Or using npm:

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Building for Production

### Backend

```bash
cd server
# Backend is ready for production with uvicorn
```

### Frontend

```bash
cd client
pnpm build
pnpm start
```

## API Documentation

Once the backend server is running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Development Guidelines

### Client/

The Next.js frontend codebase is located inside the `client/` folder. Any frontend updates must be done there.

### Server/

The backend codebase is situated inside the `server/` folder. Set up and operate a FastAPI project in that directory for all backend updates.

## Git commit conventions (required)

Follow conventional commit-style types for all commits. The commit type can be one of:

- `feat`: Commits which add a new feature.
- `fix`: Commits that fix a bug.
- `refactor`: Commits that rewrite or restructure code without changing behavior.
- `perf`: Commits that improve performance.
- `style`: Commits that do not affect code behavior (formatting, whitespace, semicolons, etc.).
- `test`: Commits that add or correct tests.
- `docs`: Commits that affect documentation only.
- `build`: Commits that affect build system, CI, dependencies, or project version.
- `ops`: Commits that affect operational components (infrastructure, deployment, backups, recovery).
- `chore`: Miscellaneous commits (e.g., modifying .gitignore, small maintenance tasks).

Use concise, descriptive commit messages following this pattern:

<type>(scope?): short description

Examples (dependency updates — MUST be separate commits):

- Backend dependency update (Django/requirements):

  chore: added django-rest-framework to requirements.txt

- Frontend dependency update (npm/package.json):

  chore: added @tanstack/react-query to package.json and updated package-lock.json

Notes and rules (enforced):

- Any dependency change — whether backend or frontend — must be committed in its own dedicated `chore:` commit. Do not bundle dependency changes with feature or bugfix commits.
- For package changes, include where the change was made (e.g., `requirements.txt`, `package.json`, `pyproject.toml`).
- If the dependency update requires code changes (e.g., API changes), those changes must be in a separate follow-up commit with an appropriate type (e.g., `feat:` or `fix:`), referencing the dependency-chore commit.
