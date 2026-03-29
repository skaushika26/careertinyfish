# CareerForge AI 🚀

An intelligent career automation platform powered by **TinyFish AI**.

## Features

- 📄 **Resume Upload & Parsing** — Upload PDF, DOCX, or TXT and AI extracts structured data
- 🏗️ **Resume Builder** — ATS-optimized resume builder with live preview and AI scoring
- 🔍 **Job Board** — Browse AI-matched job listings ranked by your resume
- ✨ **AI Resume Customization** — Per-job resume tailoring using TinyFish API
- 📝 **Cover Letter Generator** — AI-generated cover letters for each application
- 📊 **Application Tracker** — Full pipeline tracker (Saved → Applied → Interviewing → Offer)
- 🌐 **Portfolio Generator** — One-click AI-generated portfolio website

## Tech Stack

- **Frontend**: React 18 + Vite, CSS Variables, Material Icons
- **Backend**: Node.js + Express.js
- **AI**: TinyFish API
- **Database**: MongoDB (optional — in-memory fallback included)
- **HTTP Client**: Axios

## Project Structure

```
careerforge-ai/
├── backend/
│   ├── controllers/         # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── services/
│   │   └── tinyfishService.js  # TinyFish API integration
│   ├── utils/
│   │   └── resumeParser.js  # PDF/DOCX text extraction
│   ├── uploads/             # Temp file storage (auto-created)
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, shared components
│   │   ├── context/         # AppContext (global state)
│   │   ├── pages/           # All page components
│   │   ├── services/        # API client (api.js)
│   │   ├── styles/          # Global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Quick Start

### 1. Clone / Extract the project

```bash
cd careerforge-ai
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careerforge   # Optional
TINYFISH_API_KEY=your_api_key_here
TINYFISH_BASE_URL=https://api.tinyfish.io/v1
```

### 3. Install & Run Backend

```bash
cd backend
npm install
npm run dev     # Development (nodemon)
# or
npm start       # Production
```

Backend runs on **http://localhost:5000**

### 4. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

## TinyFish API Integration

The backend `services/tinyfishService.js` handles all AI calls:

| Function | Description |
|---|---|
| `parseResume(text)` | Extracts structured data from resume text |
| `customizeResume(resume, jobDesc, title)` | Tailors resume for a specific job |
| `generateCoverLetter(...)` | Writes personalized cover letters |
| `scoreATS(resume, jobDesc)` | Scores resume against ATS criteria |
| `generatePortfolio(resume)` | Creates a full HTML portfolio site |

The API format follows OpenAI-compatible `/v1/chat/completions`. Update the model name in `tinyfishService.js` if needed:

```js
model: options.model || 'tinyfish-1',  // ← change to your model name
```

## Without MongoDB

The app works fully **without MongoDB** using in-memory stores. Data resets on server restart. To persist data, install MongoDB and set `MONGODB_URI` in `.env`.

## API Endpoints

### Resume
- `POST /api/resume/upload` — Upload and parse resume file
- `POST /api/resume/build` — Save manually built resume
- `GET  /api/resume/:id` — Get resume by ID
- `PUT  /api/resume/:id` — Update resume
- `POST /api/resume/:id/ats-score` — ATS score against job

### Jobs
- `GET  /api/jobs` — List all jobs (with optional `?skills=React,Node`)
- `GET  /api/jobs/:id` — Get job details
- `POST /api/jobs/match` — Match jobs to resume data

### AI
- `POST /api/ai/customize-resume` — Customize resume for job
- `POST /api/ai/cover-letter` — Generate cover letter
- `POST /api/ai/portfolio` — Generate portfolio HTML
- `POST /api/ai/ats-score` — Score resume

### Applications
- `GET    /api/applications` — List all applications
- `POST   /api/applications` — Create application
- `PUT    /api/applications/:id` — Update status/notes
- `DELETE /api/applications/:id` — Delete application
- `POST   /api/applications/:id/apply` — Mark as applied

### Portfolio
- `POST /api/portfolio/generate` — Generate portfolio
- `GET  /api/portfolio/:id` — Get portfolio HTML

## Notes

- File uploads are limited to **5MB** (PDF, DOCX, TXT)
- All AI calls have 30-second timeouts
- In-memory stores are used when MongoDB is unavailable
- The Vite dev server proxies `/api` requests to `localhost:5000`
