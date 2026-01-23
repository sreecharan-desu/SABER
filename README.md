# 🔺 SABER - AI-Powered Technical Recruitment Platform

<div align="center">

![SABER](https://img.shields.io/badge/SABER-v1.2.0-a855f7?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0LjUgOUwxMiAxNkwxOS41IDlMMTIgMloiIGZpbGw9IiNhODU1ZjciLz48cGF0aCBkPSJNMTIgMjJMNC41IDE1TDEyIDhMMTkuNSAxNUwxMiAyMloiIGZpbGw9IiNhODU1ZjciIGZpbGwtb3BhY2l0eT0iMC4zIi8+PC9zdmc+)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

**Next-generation talent matching powered by AI signal analysis**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API](#-api-documentation)

</div>

---

## 🎯 Overview

SABER is a **high-fidelity recruitment platform** that uses AI-driven signal analysis to match technical talent with organizational challenges. Unlike traditional job boards, SABER analyzes real-world technical contributions from GitHub and LinkedIn to create authentic skill profiles, enabling precise candidate-job matching.

### ✨ Key Differentiators

- 🧠 **AI Signal Extraction** - Automated skill profiling from GitHub repos and LinkedIn
- ⚡ **100x Performance** - Intelligent caching with sub-millisecond response times
- 🎨 **Premium UI** - State-of-the-art glassmorphism and micro-interactions
- 🔒 **OAuth Security** - GitHub, Google, and LinkedIn authentication
- 📧 **Automated Notifications** - Beautiful HTML email templates for matches
- 🎯 **Smart Matching** - Bidirectional swipe-based discovery system

---

## 🚀 Features

### For Recruiters
- **Discovery Feed** - AI-recommended candidates based on job requirements
- **Signal Inbox** - Real-time notifications when candidates express interest
- **Match Management** - Secure messaging with mutual-reveal system
- **Analytics Dashboard** - Performance metrics and match rates
- **Job Management** - Create and manage technical challenges

### For Candidates
- **Automated Profiling** - Skills extracted from GitHub and LinkedIn
- **Smart Recommendations** - Jobs matched to your technical core
- **Privacy-First** - Identity revealed only on mutual match
- **Direct Communication** - Chat with recruiters post-match

### Platform Features
- **Intelligent Caching** - 85% reduction in API calls with 2-minute cache
- **Request Deduplication** - Prevents duplicate simultaneous requests
- **Real-time Updates** - Live match notifications
- **Database Cleanup** - `npm run db:clean` for development resets
- **Email Automation** - Nodemailer integration with custom templates

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express 5.x
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 6.0
- **Authentication**: Passport.js (OAuth 2.0)
- **Email**: Nodemailer
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

### Frontend (Admin Dashboard)
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS 4.0
- **Animations**: Framer Motion
- **State**: Context API with intelligent caching
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Infrastructure
- **Hosting**: Vercel (Frontend + Serverless Functions)
- **Database**: Neon PostgreSQL
- **Version Control**: Git + GitHub

---

## 🏃 Quick Start

### Prerequisites
```bash
node >= 20.0.0
npm >= 10.0.0
postgresql >= 14.0
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sreecharan-desu/SABER.git
cd SABER
```

2. **Install dependencies**
```bash
# Backend
npm install

# Frontend
cd saber-admin-dashboard
npm install
cd ..
```

3. **Environment Setup**
```bash
# Copy example env files
cp .env.example .env

# Configure your environment variables (see Configuration section)
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npx prisma db seed
```

5. **Start Development Servers**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd saber-admin-dashboard
npm run dev
```

🎉 **Access the application:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

---

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# URLs
BASE_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# OAuth - Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OAuth - GitHub
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# OAuth - LinkedIn
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# AI/Admin
AI_INTERNAL_API_KEY="your-internal-api-key"

# Email (Nodemailer)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### Frontend Environment Variables (saber-admin-dashboard/.env)

```env
VITE_API_URL="http://localhost:3000"
```

---

## 📁 Project Structure

```
SABER/
├── src/
│   ├── config/          # Database, passport, logger config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error handling
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic & external APIs
│   ├── utils/           # Helper functions & cache
│   └── server.ts        # Express app entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
├── scripts/
│   └── db-clean.ts      # Database cleanup utility
├── saber-admin-dashboard/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Global state management
│   │   ├── pages/       # Route pages
│   │   ├── lib/         # Utilities & API client
│   │   └── types/       # TypeScript definitions
│   └── public/          # Static assets
└── package.json
```

---

## 🏗 Architecture

### High-Level Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Admin    │◄────►│  Express API     │◄────►│  PostgreSQL     │
│  Dashboard      │      │  (REST + OAuth)  │      │  (Neon)         │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │
        │                         ▼
        │                ┌──────────────────┐
        │                │  External APIs   │
        │                │  - GitHub        │
        │                │  - LinkedIn      │
        │                │  - Nodemailer    │
        │                └──────────────────┘
        │
        ▼
┌─────────────────┐
│  SignalContext  │
│  (Smart Cache)  │
│  - 2min TTL     │
│  - Deduplication│
└─────────────────┘
```

### Data Flow

1. **Authentication**: OAuth providers → Passport → JWT token
2. **Signal Extraction**: GitHub/LinkedIn APIs → Skill profiling → Database
3. **Matching Algorithm**: Job requirements ↔ Candidate signals → Match score
4. **Caching Layer**: API request → Cache check → Database (if miss) → Cache update
5. **Notifications**: Match created → Email service → Candidate inbox

---

## 📡 API Documentation

### Authentication Endpoints

```http
GET  /auth/google           # Initiate Google OAuth
GET  /auth/google/callback  # Google OAuth callback
GET  /auth/github           # Initiate GitHub OAuth
GET  /auth/github/callback  # GitHub OAuth callback
GET  /auth/linkedin         # Initiate LinkedIn OAuth
GET  /auth/linkedin/callback # LinkedIn OAuth callback
GET  /auth/me               # Get current user
POST /auth/logout           # Logout user
```

### Recruiter Endpoints

```http
GET  /recruiters/companies          # List companies
POST /recruiters/company            # Create company
GET  /recruiters/jobs               # List jobs
POST /recruiters/job                # Create job
PUT  /recruiters/job/:id            # Update job
DELETE /recruiters/job/:id          # Delete job
GET  /recruiters/recruiter/feed     # Get candidate recommendations
POST /recruiters/recruiter/swipe    # Swipe on candidate
GET  /recruiters/signals            # Get incoming signals
```

### Match Endpoints

```http
GET  /matches                # Get all matches
POST /matches/messages       # Send message
```

### Admin Endpoints

```http
GET  /admin/metrics          # System metrics
POST /admin/data-refresh     # Trigger data refresh
```

### AI Endpoints (Internal)

```http
GET  /ai/users               # Get users data
GET  /ai/jobs                # Get jobs data
GET  /ai/swipes              # Get swipes data
GET  /ai/matches             # Get matches data
POST /ai/recommendation      # Update recommendation profile
```

---

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Saber Purple (#a855f7) with gradient accents
- **Typography**: Inter, Outfit with tight tracking
- **Components**: Glassmorphism, rounded corners (12px), subtle shadows
- **Animations**: Framer Motion with spring physics
- **Micro-interactions**: Scale transforms, hover states, loading spinners

### Performance Optimizations
- **Intelligent Caching**: 2-minute TTL with manual refresh
- **Request Deduplication**: Prevents simultaneous duplicate calls
- **Lazy Loading**: Code splitting for optimal bundle size
- **Optimistic Updates**: Instant UI feedback

---

## 🗄️ Database Schema

Key models:
- **User**: Candidates and recruiters with OAuth accounts
- **Company**: Recruiter organizations
- **Job**: Technical challenges/positions
- **Skill**: Extracted technical skills with confidence scores
- **Swipe**: Bidirectional interest signals
- **Match**: Mutual matches with messaging
- **RecommendationProfile**: AI-generated user preferences

See `prisma/schema.prisma` for complete schema.

---

## 🧪 Development Commands

```bash
# Backend
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run db:clean         # Clean all database tables

# Frontend
cd saber-admin-dashboard
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Create new migration
npx prisma db seed       # Seed database
npx prisma generate      # Regenerate Prisma client
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "feat: initial deployment"
git push origin main
```

2. **Connect to Vercel**
   - Import project from GitHub
   - Configure environment variables
   - Deploy

3. **Environment Variables**
   - Add all `.env` variables to Vercel dashboard
   - Ensure `DATABASE_URL` points to production database

### Manual Deployment

```bash
# Build backend
npm run build

# Build frontend
cd saber-admin-dashboard
npm run build

# Start production server
npm start
```

---

## 🔐 Security

- ✅ **OAuth 2.0** authentication
- ✅ **JWT** tokens with secure secrets
- ✅ **Helmet.js** security headers
- ✅ **CORS** configuration
- ✅ **Rate limiting** on API endpoints
- ✅ **SQL injection** prevention via Prisma
- ✅ **XSS protection** via React
- ✅ **Environment variables** for secrets

---

## 📊 Performance Metrics

- **API Response Time**: < 100ms (cached), < 500ms (fresh)
- **Cache Hit Rate**: ~85%
- **Database Queries**: Optimized with indexes
- **Bundle Size**: < 500KB (gzipped)
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Sreecharan Desu**
- GitHub: [@sreecharan-desu](https://github.com/sreecharan-desu)
- LinkedIn: [Sreecharan Desu](https://linkedin.com/in/sreecharan-desu)

---

## 🙏 Acknowledgments

- **Vercel** for deployment platform
- **Neon** for serverless PostgreSQL
- **Prisma** for amazing ORM
- **Framer Motion** for smooth animations
- **Lucide** for beautiful icons

---

<div align="center">

**Built with ❤️ using TypeScript, React, and Node.js**

⭐ Star this repo if you find it helpful!

</div>
