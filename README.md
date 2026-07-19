# Novara AI

<p align="center">
  <img src="./frontend/public/logo.png" width="120" alt="Novara AI Logo">
</p>

<p align="center">
An intelligent AI workspace built with React, Node.js, Express, MongoDB, and Groq AI.
</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue)

</p>

---

## Overview

Novara AI is a modern AI-powered conversational platform designed to deliver a seamless chat experience with a polished, production-ready interface.

Built with a scalable full-stack architecture, Novara AI combines real-time AI conversations, document intelligence, speech capabilities, conversation management, and user personalization into a single workspace.

The project follows production-oriented software engineering practices including modular architecture, reusable components, RESTful APIs, secure authentication, CI/CD, and responsive UI design.

---

## Demo

> Live Demo: **Coming Soon**

> API Documentation: `http://localhost:5000/api/docs`

---

# Features

### AI Chat

- Real-time AI conversations
- Streaming responses
- Markdown rendering
- Code syntax highlighting
- Mermaid diagrams
- LaTeX support
- Multiple AI model support
- Regenerate responses
- Branch conversations

---

### Conversation Management

- Unlimited chat threads
- Automatic AI-generated titles
- Rename conversations
- Delete conversations
- Archive & Pin chats
- Global search
- Export conversations
- Share conversations

---

### Authentication

- Guest Mode
- Email & Password Authentication
- Google Sign-In
- JWT Authentication
- Guest chat migration

---

### Document Intelligence

Supports

- PDF
- DOCX
- TXT
- Markdown
- CSV
- JSON
- Images

Capabilities

- OCR
- Image Understanding
- Document Summarization
- AI-powered Extraction

---

### Speech

- Speech-to-Text
- Text-to-Speech
- Voice Recording
- Live Recording Indicators

---

### Personalization

- Multiple Themes
- AI Model Selection
- Profile Settings
- Notifications
- User Preferences

---

### Security

- JWT Authentication
- Helmet
- Rate Limiting
- Mongo Sanitization
- CORS Protection
- Request Validation
- Audit Logging

---

# Tech Stack

| Frontend | Backend | Database | AI | DevOps |
|-----------|----------|-----------|------|---------|
| React | Node.js | MongoDB Atlas | Groq AI | GitHub Actions |
| Vite | Express | Mongoose | Llama Models | Docker |
| React Router | JWT | | Vision AI | Vercel |
| Context API | Multer | | | Render |

---

# Architecture

```
               React + Vite
                     │
                     │
        ┌────────────▼────────────┐
        │      Express API         │
        └────────────┬────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
  MongoDB        Groq AI       Firebase
   Atlas         Services      Authentication
```

---

# Project Structure

```
Novara-AI

frontend/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
│
backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── tests/

.github/

README.md
```

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/<your-username>/Novara-AI.git

cd Novara-AI
```

---

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

# Environment Variables

Backend

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

GROQ_API_KEY=

GROQ_MODEL=

CLIENT_URL=http://localhost:5173
```

---

# Running Locally

Backend

```bash
cd backend

npm run dev
```

Frontend

```bash
cd frontend

npm run dev
```

---

# Build

Frontend

```bash
npm run build
```

Backend

```bash
npm test
```

---

# Screenshots

| Landing | Chat |
|---------|------|
| *(Add Screenshot)* | *(Add Screenshot)* |

| Settings | Admin Dashboard |
|----------|-----------------|
| *(Add Screenshot)* | *(Add Screenshot)* |

---

# Roadmap

- ✅ AI Chat
- ✅ Guest Mode
- ✅ Authentication
- ✅ Speech Recognition
- ✅ Image Understanding
- ✅ Document Upload
- ✅ Global Search
- ✅ Conversation Sharing
- ✅ Analytics Dashboard
- ✅ Admin Dashboard
- ✅ Production Security
- ✅ CI/CD

Future

- Mobile Application
- AI Agents
- Plugin Marketplace
- Workspace Collaboration
- RAG Knowledge Base

---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# License

Licensed under the MIT License.

---

# Author

**Afshan**

GitHub: https://github.com/IronVortex

---

<p align="center">

Built with React • Express • MongoDB • Groq AI

**Novara AI — Intelligent conversations, beautifully designed.**

</p>