# Fullstack eLearning Platform

Welcome to the fullstack eLearning Platform repository! This project consists of a modern frontend built with Next.js and a robust backend built with NestJS, utilizing GraphQL for efficient data fetching and manipulation.

## Project Structure

This repository is organized into a monorepo-style structure containing two main directories:

- `/elearning-frontend`: The Next.js web application.
- `/elearning-backend`: The NestJS GraphQL server.

## Technologies Used

### Frontend (`elearning-frontend`)
- **Framework**: [Next.js](https://nextjs.org/) (v16) with React 19
- **Data Fetching**: [Apollo Client](https://www.apollographql.com/docs/react/) & GraphQL
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4) & Radix UI
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Media**: `react-player` for videos, Next Cloudinary for media assets
- **Content Parsing**: `react-markdown`, `remark-gfm`, and `react-syntax-highlighter`
- **Forms & Validation**: React Hook Form with Zod
- **AI Integration**: Google GenAI

### Backend (`elearning-backend`)
- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **API**: GraphQL with Apollo Server (`@nestjs/graphql`, `@nestjs/apollo`)
- **Database ORM**: [Prisma](https://www.prisma.io/) (`@prisma/client`)
- **Authentication**: Passport.js, JWT (`@nestjs/jwt`), bcrypt
- **Media Storage**: Cloudinary
- **AI Integration**: Google GenAI

## Key Features
- **User Authentication**: Secure JWT-based login and registration.
- **Course & Lesson Management**: Curriculum editor for creating and managing courses.
- **Video Playback**: Embedded video lessons.
- **AI-Powered Quizzes**: Automatic generation of quizzes using Google Gemini AI based on lesson markdown content.
- **Learning Interface**: Rich markdown rendering, progress tracking, and interactive view.
- **Certificates**: Interactive certificates upon course completion.

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm, yarn, or pnpm
- A relational database (configured via Prisma, typically PostgreSQL or MySQL)
- Accounts and API Keys for:
  - Google Gemini AI
  - Cloudinary

### 1. Backend Setup
Navigate to the backend directory:
```bash
cd elearning-backend
```

Install dependencies:
```bash
npm install
```

Configure Environment Variables:
Create a `.env` file in the `elearning-backend` directory and add your connection strings and secrets (e.g., `DATABASE_URL`, `JWT_SECRET`, Cloudinary credentials, Google GenAI API key).

Set up Prisma and Database:
```bash
npx prisma generate
npx prisma db push
# or npx prisma migrate dev
```

Start the development server:
```bash
npm run start:dev
```
The backend GraphQL playground is typically available at `http://localhost:3000/graphql`.

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd elearning-frontend
```

Install dependencies:
```bash
npm install
```

Configure Environment Variables:
Create a `.env` or `.env.local` file in the `elearning-frontend` directory and add necessary variables (e.g., `NEXT_PUBLIC_GRAPHQL_ENDPOINT`).

Start the development server:
```bash
npm run dev
```
The frontend application will run at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

## Common Commands

### Backend
- `npm run start:dev` - Starts the development server with watch mode.
- `npm run build` - Builds the application.
- `npx prisma studio` - Opens the Prisma Studio to view and edit database records on `http://localhost:5555`.

### Frontend
- `npm run dev` - Starts the Next.js development server.
- `npm run build` - Builds the Next.js application for production.
- `npm run lint` - Runs ESLint.

## Development

- Make sure both servers (Next.js and NestJS) are running concurrently during development.
- For schema changes, after updating `schema.prisma` in the backend, always run `npx prisma generate` and reflect the required mutations/queries in the frontend.
