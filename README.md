# 🎓 Full Course — Fullstack eLearning Platform

A modern, full-featured eLearning platform built with **Next.js 16** and **NestJS 11**, featuring AI-powered content, gamification, and secure JWT authentication.

🌐 **Live Demo**: [https://full-course-eta.vercel.app](https://full-course-eta.vercel.app)

## 📸 Features Overview

### For Students
- 📚 Browse & enroll in courses with category filtering
- 🎬 Video lessons with progress tracking & resume playback
- 📝 Interactive quizzes (AI-generated from lesson content)
- 💬 Comments & discussion on each lesson
- 🗒️ Timestamped notes synced with video
- 🏆 Gamification: points, badges, leaderboard, login streaks
- 🎓 Certificates upon course completion
- 🤖 AI-powered learning assistant & skill assessment

### For Instructors
- 📋 Course creation with curriculum editor (sections & lessons)
- 🎥 Video upload via Cloudinary
- 📝 Markdown lesson editor with rich content support
- ❓ Quiz management with AI auto-generation
- 📊 Student progress tracking & enrollment approval
- 🏅 Custom badge creation for courses

### For Admins
- 👥 User & course management
- 📊 Platform-wide analytics & oversight

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT                                │
├──────────────┬──────────────────┬────────────────┬───────────────┤
│   Vercel     │    Railway       │    Neon        │  Cloudinary   │
│   Frontend   │    Backend       │    Database    │  Media        │
│   (Next.js)  │    (NestJS)      │  (PostgreSQL)  │  (Images/Vid) │
└──────┬───────┴────────┬─────────┴───────┬────────┴───────┬───────┘
       │                │                 │                │
       │   Rewrite      │    Prisma ORM   │    Upload API  │
       │   /graphql ──► │ ◄──────────────►│                │
       │                │                 │                │
└──────┴────────────────┴─────────────────┴────────────────┘
```

## 🛠️ Tech Stack

### Frontend (`elearning-frontend`)
| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Data Fetching** | Apollo Client 4 + GraphQL |
| **Styling** | Tailwind CSS 4 + Radix UI |
| **Animations** | Framer Motion |
| **Forms** | React Hook Form + Zod validation |
| **Media** | react-player, next-cloudinary |
| **Content** | react-markdown, react-syntax-highlighter |
| **Charts** | Recharts |
| **Auth** | jose (JWT verify in middleware) |
| **AI** | Google Generative AI |

### Backend (`elearning-backend`)
| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 11 |
| **API** | GraphQL (Apollo Server 5) |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma 6 |
| **Auth** | Passport.js + JWT + bcrypt |
| **Media** | Cloudinary SDK |
| **Email** | Nodemailer (SMTP) |
| **AI** | Google Generative AI (Gemini) |

## 📁 Project Structure

```
Full_Course/
├── elearning-frontend/          # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── (auth)/          # Login & Register pages
│       │   ├── (marketing)/     # Public pages (home, courses, checkout)
│       │   ├── (dashboard)/     # Protected dashboards
│       │   │   ├── student/     # Student dashboard
│       │   │   ├── instructor/  # Instructor dashboard
│       │   │   ├── admin/       # Admin dashboard
│       │   │   ├── profile/     # User profile
│       │   │   ├── interview/   # AI mock interview
│       │   │   └── certificates/# Certificate viewer
│       │   ├── (learning)/      # Course learning interface
│       │   └── api/auth/        # Server-side auth API routes
│       ├── components/          # Reusable UI components
│       ├── lib/                 # Apollo client, constants, GraphQL queries
│       └── middleware.ts        # Route protection & RBAC
│
├── elearning-backend/           # NestJS backend
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Seed data
│   └── src/
│       ├── auth/                # Authentication (JWT, Passport)
│       ├── courses/             # Course CRUD
│       ├── learning/            # Enrollment, progress, certificates
│       ├── quiz/                # Quiz management
│       ├── comments/            # Lesson comments
│       ├── notes/               # Timestamped notes
│       ├── orders/              # Course purchases
│       ├── categories/          # Course categories
│       ├── gamification/        # Points, badges, leaderboard, streaks
│       ├── assessments/         # Standalone exams
│       ├── ai/                  # AI services (quiz gen, assistant, rank)
│       ├── interview/           # AI mock interview
│       ├── cloudinary/          # Media upload & certificate generation
│       ├── email/               # Email service (SMTP)
│       └── prisma/              # Prisma service
│
└── README.md
```

## 🔐 Authentication Flow

The app uses a **BFF (Backend for Frontend)** pattern with **HttpOnly cookies**:

```
1. User submits login form
   → Browser calls POST /api/auth/login (Next.js API Route)
   → Vercel server calls NestJS backend (server-to-server)
   → Backend verifies credentials, returns JWT tokens
   → Next.js sets HttpOnly cookies (access_token, refresh_token)

2. Subsequent API calls
   → Apollo Client calls /graphql (relative URL, same domain)
   → Cookie sent automatically → Next.js rewrites to Railway backend
   → Backend reads JWT from cookie → processes request

3. Token expired (15 min)
   → Apollo ErrorLink catches UNAUTHENTICATED error
   → Auto-calls /api/auth/refresh using refresh_token cookie
   → New tokens issued → original request retried silently

4. Refresh token expired (7 days)
   → All cookies cleared → redirect to /login
```

**Security highlights:**
- ✅ HttpOnly cookies (JS cannot read tokens → XSS protection)
- ✅ Secure + SameSite=Lax (HTTPS only, basic CSRF protection)
- ✅ Short-lived access token (15 min) + long-lived refresh token (7 days)
- ✅ bcrypt password hashing (10 rounds)
- ✅ Role-based access control via middleware (STUDENT / INSTRUCTOR / ADMIN)

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+
- **npm** (or yarn/pnpm)
- **PostgreSQL** database (or use [Neon](https://neon.tech) free tier)
- API keys for: **Google Gemini AI**, **Cloudinary**, **Gmail SMTP** (optional)

### 1. Clone & Install

```bash
git clone https://github.com/Tama0026/Full_Course.git
cd Full_Course
```

### 2. Backend Setup

```bash
cd elearning-backend
npm install
```

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="E-Learning <your-email@gmail.com>"
```

Set up database & start:

```bash
npx prisma generate
npx prisma migrate dev    # Create tables
npx prisma db seed        # Seed sample data
npm run start:dev         # Start dev server (port 4000)
```

**Seeded accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@elearning.com` | `Admin@123` |
| Instructor | `instructor@example.com` | `password123` |
| Student | `student@example.com` | `password123` |

### 3. Frontend Setup

```bash
cd elearning-frontend
npm install
```

Create `.env.local` file:

```env
# For server-side API routes (points to backend directly)
NEXT_PUBLIC_GRAPHQL_ENDPOINT="http://127.0.0.1:4000/graphql"

# JWT secret (must match backend's JWT_SECRET for middleware verification)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

Start the dev server:

```bash
npm run dev               # Start dev server (port 3000)
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: Both frontend and backend must be running simultaneously for the app to work.

### 4. Certificate Template (Optional)

To enable automatic certificate generation:

1. Upload a blank certificate template image to **Cloudinary**
2. Set its **Public ID** to `swt470ijgwmqhm6utf6h`
3. Or change `templatePublicId` in `elearning-backend/src/cloudinary/cloudinary.service.ts`

## ☁️ Deployment

| Service | Platform | Free Tier |
|---------|----------|-----------|
| **Database** | [Neon](https://neon.tech) | ✅ 0.5GB free |
| **Backend** | [Railway](https://railway.com) | ✅ $5/month credit |
| **Frontend** | [Vercel](https://vercel.com) | ✅ Free (hobby) |

### Deploy Backend (Railway)

1. Connect GitHub repo → set **Root Directory**: `elearning-backend`
2. **Build Command**: `npm install --include=dev && npx prisma generate && npx tsc -p tsconfig.build.json`
3. **Start Command**: `npx prisma migrate deploy && npm run start:prod`
4. Add all environment variables from `.env`
5. Generate public domain (port `8080`)

### Deploy Frontend (Vercel)

1. Import GitHub repo → set **Root Directory**: `elearning-frontend`
2. Add environment variables:
   - `NEXT_PUBLIC_GRAPHQL_ENDPOINT` = `https://your-backend.up.railway.app/graphql`
   - `JWT_SECRET` = same as backend
3. Deploy — Vercel auto-builds on push

> **Important**: The frontend's `next.config.ts` rewrites `/graphql` to the backend URL. Apollo Client uses relative URL `/graphql` so HttpOnly cookies work correctly across domains.

## 📋 Common Commands

### Backend (`elearning-backend`)
| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production server |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |
| `npx prisma migrate dev` | Create & apply migration |
| `npx prisma db seed` | Seed sample data |

### Frontend (`elearning-frontend`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 📄 License

This project is UNLICENSED — private use only.
