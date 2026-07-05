<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square" alt="build passing" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/FastAPI-teal.svg?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/SQLite-blue.svg?style=flat-square&logo=sqlite" alt="SQLite" />
</p>

<h1 align="center">Cognee Chat v2.0</h1>
<p align="center">
  <strong>Graph‑RAG chat with persistent knowledge graphs, powered by <a href="https://github.com/topoteretes/cognee">Cognee</a>, React Flow, and FastAPI.</strong><br/>
  Ingest documents → build a knowledge graph → chat with traceable, multi‑hop reasoning.
</p>

---

## Architecture

```
┌──────────────────────────┐
│  Next.js 16 App Router   │
│  • Tailwind CSS v4       │
│  • React Flow graph      │
│  • better‑sqlite3 (sess) │
└───────────┬──────────────┘
            │  fetch() → http://127.0.0.1:{port}
            ▼
┌──────────────────────────┐
│  FastAPI Backend         │
│  • /chat – graph recall  │
│  • /ingest/text          │
│  • /ingest/file          │
│  • /graph/visualize      │
│  • /generate-title       │
│  • /reset                │
│  • /health               │
└───────────┬──────────────┘
            │  cognee SDK
            ▼
┌──────────────────────────┐
│  Cognee Engine           │
│  • Graph construction    │
│  • Embedding & storage   │
│  • Memory persistence    │
└───────────┬──────────────┘
            │  kuzu (graph) / SQLite (sessions)
            ▼
┌──────────────────────────┐
│  SQLite / Kuzu           │
│  (knowledge graph +      │
│   session + chat history)│
└──────────────────────────┘
```

---

## Features

### Frontend
- **Multi‑page dark‑mode UI** — Chat, Ingest, Graph, and Settings pages with persistent sidebar navigation.
- **Live knowledge‑graph visualization** — React Flow with dagre auto‑layout, node selection, and search/filter.
- **Markdown rendering** — AI responses formatted with `react-markdown` and `rehype-highlight` code highlighting.
- **Persistent sessions** — SQLite‑backed chat sessions survive server restarts; rename or delete from the sidebar.
- **SSE streaming support** — stop‑generation button; gracefully falls back to non‑streaming when backend returns JSON.
- **Theme toggle** — switch dark/light mode at runtime via CSS custom properties.
- **LLM model selector** — pick from 5 presets stored in localStorage.

### Backend (FastAPI + Cognee)
- **`POST /chat`** — graph‑aware recall → LLM generation.
- **`POST /ingest/text`** & **`POST /ingest/file`** — accept text/files, pass to `cognee.remember()`.
- **`GET /graph/visualize`** — returns nodes + edges with confidence weights.
- **`POST /generate-title`** — LLM call to produce a short chat title.
- **`DELETE /reset`** — wipe the knowledge graph entirely.
- **`GET /health`** — backend status check.

---

## Directory Structure

```
Cognee-Chat-v2.0/
├── .env                      # LLM keys + backend config (gitignored)
├── .env.example              # Template with placeholder values
├── .gitignore
├── README.md
├── requirements.txt          # Python deps (FastAPI, Cognee, LiteLLM, …)
├── api.py                    # FastAPI application entry point
├── start_backend.py          # Uvicorn launcher (writes .port)
│
├── app/                      # Next.js 16 App Router
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── globals.css           # CSS custom properties, theme variables
│   ├── layout.tsx            # root layout (sidebar + main content)
│   ├── page.tsx              # homepage (redirects to /chat)
│   │
│   ├── lib/
│   │   ├── api.ts            # API client (cached base URL, all endpoints)
│   │   └── db.ts             # better‑sqlite3 wrapper (session CRUD)
│   │
│   ├── app/
│   │   ├── sidebar.tsx       # nav + session list + graph stats
│   │   │
│   │   ├── chat/page.tsx     # chat interface (markdown, streaming, sessions)
│   │   ├── graph/page.tsx    # React Flow graph visualization
│   │   ├── ingest/page.tsx   # text/file ingest + danger zone reset
│   │   └── settings/page.tsx # model picker, theme toggle, backend status
│   │
│   └── api/
│       ├── port/route.ts     # read .port file
│       └── sessions/
│           ├── route.ts      # GET (list) / POST (upsert) sessions
│           └── [id]/route.ts # GET / DELETE single session
│
└── data/                     # SQLite database (auto‑created, gitignored)
    └── cognee.db
```

---

## Local Setup

### 0. Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10

### 1. Clone & Environment

```bash
git clone https://github.com/Mr-Broccolli/Cognee-Chat-v2.0.git
cd Cognee-Chat-v2.0
```

### 2. Backend

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
source venv/bin/activate      # macOS / Linux
pip install -r requirements.txt
python start_backend.py
```

### 3. Frontend

```bash
cd app
npm install
npm run dev                    # http://localhost:3000
```

### 4. Smoke Test

1. Open `http://localhost:3000`.
2. Click **Ingest** → paste text → *Ingest Text*.
3. Switch to **Graph** — nodes and edges should appear.
4. Go to **Chat** → ask a question about what you ingested.

---

## Tech Stack

| Layer    | Technology                                         |
|----------|-----------------------------------------------------|
| UI       | Next.js 16, Tailwind CSS v4, React 19               |
| Graph    | React Flow 11, dagre                                |
| Sessions | better‑sqlite3 (direct, no ORM)                     |
| Backend  | FastAPI, Uvicorn                                    |
| RAG      | Cognee (open‑source graph‑RAG memory platform)      |
| LLM      | LiteLLM (OpenRouter → Meta Llama 3.1)               |
| Embed    | FastEmbed (BAAI/bge‑small‑en‑v1.5)                  |
| Graph DB | Kuzu                                                 |
| Session  | SQLite                                              |

---

## License

MIT — see [LICENSE](LICENSE).
