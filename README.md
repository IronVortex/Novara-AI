# Novara AI

Premium AI chat workspace built with React, Node.js, MongoDB, and Groq.

## Features

- JWT authentication with protected routes
- Streaming AI responses with stop, regenerate, edit, and continue
- Conversation memory (last 20 messages) with summarization
- Dark glassmorphism UI with light mode toggle
- Pinned/favorite chats, rename, delete confirmation
- Command palette (`Ctrl+K`) and keyboard shortcuts
- Voice input, text-to-speech, drag-and-drop uploads, PDF/document chat
- Export to Markdown/PDF, copy/share conversation
- Message reactions, bookmarks, and in-conversation search
- Production middleware: Helmet, rate limiting, compression, logging
- Swagger API docs, Docker, and GitHub Actions CI

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, React Router, Context API |
| Backend | Express 5, Mongoose, JWT, Groq SDK |
| Database | MongoDB |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
# Set MONGODB_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev
```

API: `http://localhost:5000`  
Docs: `http://localhost:5000/api/docs`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Docker

```bash
export JWT_SECRET=your-secret
export GROQ_API_KEY=your-groq-key
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `GROQ_API_KEY` | Yes | Groq API key |
| `CORS_ORIGIN` | No | Allowed frontend origin |
| `PORT` | No | Server port (default 5000) |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | API base URL |

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/chats/thread
PATCH  /api/chats/thread/:id
DELETE /api/chats/thread/:id
POST   /api/chats/chat
POST   /api/chats/chat/stream
POST   /api/chats/regenerate
POST   /api/chats/continue
POST   /api/chats/edit
POST   /api/chats/upload
GET    /api/chats/thread/:id/export
```

## Scripts

```bash
# Backend
npm run dev
npm test
npm start

# Frontend
npm run dev
npm run build
npm run lint
```

## Deployment Notes

- **Frontend (Vercel):** set `VITE_API_URL` to your Render backend URL
- **Backend (Render):** set env vars from `.env.example`, enable health check on `/health`
- **MongoDB Atlas:** use connection string for `MONGODB_URI`

## License

ISC
