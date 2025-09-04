# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

### Development Environment Setup
```powershell
# Initial setup (Windows)
.\scripts\setup-dev.ps1

# Manual setup
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt

cd ..\frontend
npm install
```

### Development Servers
```bash
# Start full stack with Docker Compose
docker-compose up -d

# Backend only (requires PostgreSQL and Redis running)
cd backend
uvicorn main:app --reload

# Frontend only
cd frontend
npm start
```

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Integration tests with Docker
docker-compose -f docker-compose.test.yml up --build
```

### Database Operations
```bash
# Create database (manual setup)
createdb adcopysurge

# Run database migrations
cd backend
alembic upgrade head

# Generate new migration
alembic revision --autogenerate -m "description"
```

### Build & Deploy
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Frontend production build
cd frontend
npm run build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## Architecture Overview

AdCopySurge is a full-stack SaaS platform for AI-powered ad copy analysis with the following high-level architecture:

### Backend (FastAPI + Python)
- **Location**: `backend/`
- **Entry Point**: `main.py` - FastAPI application with CORS middleware
- **Core Components**:
  - `app/api/` - REST API endpoints (auth, ads, analytics, subscriptions)
  - `app/services/` - Business logic and AI analysis engines
  - `app/models/` - SQLAlchemy ORM models for PostgreSQL
  - `app/core/` - Configuration and database connection management

### Frontend (React + Material-UI)
- **Location**: `frontend/`
- **Entry Point**: `src/index.js` → `src/App.js`
- **Key Components**:
  - `src/pages/` - Route-level components (Dashboard, AdAnalysis, etc.)
  - `src/services/` - API client and authentication context
  - Material-UI theming with custom primary/secondary colors

### AI Analysis Pipeline
The core analysis flow involves multiple specialized analyzers:
1. **Readability Analyzer** (`services/readability_analyzer.py`) - Text complexity scoring
2. **Emotion Analyzer** (`services/emotion_analyzer.py`) - Emotional impact analysis
3. **CTA Analyzer** (`services/cta_analyzer.py`) - Call-to-action effectiveness
4. **Platform Optimization** - Platform-specific scoring (Facebook, Google, LinkedIn, TikTok)

### Data Flow
1. User submits ad copy via React frontend
2. API validates user subscription limits (`/api/ads/analyze`)
3. `AdAnalysisService` orchestrates multiple AI analyzers
4. Results stored in PostgreSQL (`ad_analyses` table)
5. Frontend displays scores, alternatives, and recommendations

### Background Processing
- **Celery Worker**: `docker-compose.yml` defines worker service for heavy AI tasks
- **Redis**: Used for task queuing and caching
- **OpenAI Integration**: GPT-powered alternative generation

## Key Technologies

### Backend Stack
- FastAPI 0.104.1 (async web framework)
- SQLAlchemy 2.0.23 (ORM)
- PostgreSQL 15 (primary database)
- Redis 7 (caching/queuing)
- OpenAI GPT + Hugging Face Transformers (AI analysis)
- Celery 5.3.4 (background tasks)

### Frontend Stack
- React 18.2.0 with React Router v6
- Material-UI v5 (components and theming)
- React Query 3.39.3 (server state management)
- Axios 1.3.4 (HTTP client)
- React Hook Form + Yup (form handling/validation)

### Database Schema
Key models:
- `User` - User accounts with subscription tiers (free/basic/pro)
- `AdAnalysis` - Analysis results with scores and JSON analysis data
- `CompetitorBenchmark` - Competitor ad comparisons
- `AdGeneration` - AI-generated alternative variations

## Environment Configuration

### Required Environment Variables
```env
# Core API keys (mandatory)
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://username:password@localhost/adcopysurge

# Security (change in production)
SECRET_KEY=your-secret-key-here

# Optional integrations
STRIPE_SECRET_KEY=sk_test_...  # For payments
HUGGINGFACE_API_KEY=hf_...     # For additional NLP models
REDIS_URL=redis://localhost:6379
```

### Configuration Files
- `.env` - Environment variables (copy from `.env.example`)
- `backend/app/core/config.py` - Pydantic settings with validation
- `docker-compose.yml` - Local development services
- `docker-compose.prod.yml` - Production configuration (if exists)

## Development Workflow

### Local Development Setup
1. Copy `.env.example` to `.env` and configure API keys
2. Use Docker Compose for full stack: `docker-compose up -d`
3. Or run services individually:
   - Backend: `cd backend && uvicorn main:app --reload`
   - Frontend: `cd frontend && npm start`
4. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API docs: http://localhost:8000/api/docs

### Service Dependencies
- Backend requires PostgreSQL and Redis
- Frontend proxies API requests to localhost:8000
- Worker service processes background AI tasks via Celery

### Subscription Management
- Three tiers: Free (5 analyses/month), Basic ($49, 100 analyses), Pro ($99, 500 analyses)
- Stripe integration for payment processing
- Usage tracking in `User.monthly_analyses`

## Project Structure Notes

### Backend Organization
- API routes follow RESTful patterns with clear endpoint grouping
- Service layer handles business logic and AI orchestration
- Models use SQLAlchemy with relationship mapping
- Configuration uses Pydantic for type safety and validation

### Frontend Organization
- Route-based code splitting with React Router
- Centralized API service with axios interceptors
- Auth context provides authentication state across components
- Material-UI theming configured in App.js

### AI Analysis Components
Each analyzer is modular and can be extended:
- Readability: Uses textstat library for complexity metrics
- Emotion: Leverages transformers for sentiment analysis
- CTA: Platform-specific call-to-action optimization
- Alternatives: OpenAI GPT generates variations with improvement rationale

This architecture supports the core business model of analyzing ad copy performance and generating optimized alternatives across multiple advertising platforms.
