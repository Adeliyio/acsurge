# AdCopySurge - AI-Powered Ad Copy Analysis Platform

![AdCopySurge Logo](docs/logo.png)

AdCopySurge is a comprehensive SaaS platform that analyzes ad creatives and predicts their performance using artificial intelligence. It helps agencies, SMBs, and freelance marketers create better-performing ads by providing detailed scoring, competitor benchmarking, and AI-generated alternatives.

## 🚀 Features

### Core Analysis Features
- **Readability & Clarity Scoring** - Analyzes text complexity and readability
- **Persuasion Analysis** - Detects power words and persuasive elements
- **Emotion Analysis** - Measures emotional impact and tone
- **CTA Strength Evaluation** - Scores call-to-action effectiveness
- **Platform Optimization** - Tailored analysis for Facebook, Google, LinkedIn, TikTok

### AI-Powered Generation
- **Alternative Variations** - Generate persuasive, emotional, stats-heavy variants
- **Platform-Specific Optimization** - Customized for each advertising platform
- **Performance Prediction** - AI-driven engagement scoring

### Business Features
- **Competitor Benchmarking** - Compare against top-performing ads
- **PDF Report Generation** - Professional reports for agencies
- **Usage Analytics** - Track performance improvements over time
- **Subscription Management** - Tiered pricing ($49-99/month)

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── api/           # API routes
│   ├── core/          # Configuration & database
│   ├── models/        # SQLAlchemy models
│   ├── services/      # Business logic
│   └── utils/         # Helper functions
├── requirements.txt
├── Dockerfile
└── main.py
```

### Frontend (React)
```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route components
│   ├── services/      # API client & auth
│   └── utils/         # Helper functions
├── package.json
├── Dockerfile
└── public/
```

### Key Technologies
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Redis
- **AI/ML**: OpenAI GPT, Hugging Face Transformers, scikit-learn
- **Frontend**: React 18, Material-UI, React Query
- **Authentication**: JWT with bcrypt password hashing
- **Payments**: Stripe integration
- **Deployment**: Docker, Docker Compose

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/adcopysurge.git
cd adcopysurge
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs

### Manual Installation

#### Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up database**
```bash
# Create PostgreSQL database
createdb adcopysurge

# Run migrations
alembic upgrade head
```

4. **Start the server**
```bash
uvicorn main:app --reload
```

#### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start development server**
```bash
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost/adcopysurge

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI APIs
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Stripe (for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## 📝 API Documentation

The API follows RESTful conventions and includes comprehensive documentation.

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/token` - Login and get access token
- `GET /api/auth/me` - Get current user info

### Analysis Endpoints
- `POST /api/ads/analyze` - Analyze ad copy
- `GET /api/ads/history` - Get analysis history
- `GET /api/ads/analysis/{id}` - Get specific analysis
- `POST /api/ads/generate-alternatives` - Generate ad variants

### Subscription Endpoints
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/upgrade` - Upgrade subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

### Full API documentation available at `/api/docs` when running the server.

## 💰 Subscription Tiers

### Free Plan
- 5 analyses per month
- Basic scoring
- Limited alternatives

### Basic Plan ($49/month)
- 100 analyses per month
- Full AI analysis
- Unlimited alternatives
- Competitor benchmarking
- PDF reports

### Pro Plan ($99/month)
- 500 analyses per month
- Premium AI models
- Advanced competitor analysis
- White-label reports
- API access
- Priority support

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
docker-compose -f docker-compose.test.yml up --build
```

## 🚀 Deployment

### Production Deployment

1. **Set production environment variables**
```bash
export DEBUG=False
export DATABASE_URL=your-production-db-url
export SECRET_KEY=your-production-secret-key
```

2. **Build and deploy with Docker**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Recommended Hosting Platforms
- **Backend**: Railway, Heroku, DigitalOcean App Platform
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Railway PostgreSQL, Heroku Postgres, AWS RDS

## 📊 Analytics & Monitoring

The platform includes built-in analytics for:
- User engagement metrics
- Analysis performance trends
- Subscription conversion rates
- API usage statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [API Documentation](http://localhost:8000/api/docs)
- [Frontend Demo](http://localhost:3000)
- [Issue Tracker](https://github.com/yourusername/adcopysurge/issues)

## 📞 Support

For support and questions:
- Email: support@adcopysurge.com
- Discord: [AdCopySurge Community](https://discord.gg/adcopysurge)
- Documentation: [docs.adcopysurge.com](https://docs.adcopysurge.com)

---

Built with ❤️ for better ad performance
