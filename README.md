<div align="center">

# 🧠 Cognee Chat v2.0

**Talk to your own knowledge graph.**  
Ingest documents, build a smart graph, and chat with AI that *remembers* connections.

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/FastAPI-teal?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React_Flow-purple?style=flat-square" alt="React Flow" />
  <img src="https://img.shields.io/badge/SQLite-blue?style=flat-square&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" />
</p>

![Dark mode UI screenshot showing chat interface with sidebar](https://img.shields.io/badge/UI-Dark%20Mode-%230c0e14?style=flat-square)

</div>

---

## ✨ What is This?

**Cognee Chat** is an AI chat app where you can:

1. **📥 Ingest** — paste text or upload files (.txt, .pdf, .docx, .md)
2. **🔗 Build a Graph** — the AI automatically finds connections between ideas
3. **💬 Chat** — ask questions and get answers with context from your data

It uses [Cognee](https://github.com/topoteretes/cognee) (a graph-RAG engine) under the hood, so the AI doesn't just search keywords — it understands relationships between your information.

---

## 🏗️ How It Works

```
                           ┌─────────────────────┐
                           │   Your Browser       │
                           │  (Dark mode UI)      │
                           └──────────┬──────────┘
                                      │
                           ┌──────────▼──────────┐
                           │   Next.js 16        │
                           │  • Chat, Ingest,    │
                           │    Graph, Settings  │
                           └──────────┬──────────┘
                                      │  fetch() to backend
                                      ▼
                           ┌─────────────────────┐
                           │   FastAPI Backend    │
                           │  • /chat            │
                           │  • /ingest          │
                           │  • /graph/visualize │
                           │  • /reset           │
                           └──────────┬──────────┘
                                      │  cognee SDK
                                      ▼
                           ┌─────────────────────┐
                           │   Cognee Engine     │
                           │  (Graph-RAG memory) │
                           └──────────┬──────────┘
                                      │
                           ┌──────────▼──────────┐
                           │   SQLite  +  Kuzu    │
                           │  sessions  knowledge  │
                           │           graph      │
                           └─────────────────────┘
```

---

## 🚀 How to Run (Step by Step)

### 📋 What You Need

| Tool | Version | Why? |
|------|---------|------|
| **Python** | 3.10 or newer | Runs the AI backend |
| **Node.js** | 18 or newer | Runs the web app |
| **npm** | (comes with Node.js) | Installs frontend packages |

> 💡 **Don't know if you have these?** Open a terminal and type `python --version`, `node --version`, and `npm --version`. If you see numbers, you're good!

---

### 📦 Step 1: Download the Project

Open a **terminal** (Command Prompt on Windows, Terminal on Mac/Linux) and run:

```bash
# Download the code
git clone https://github.com/Mr-Broccolli/Cognee-Chat-v2.0.git

# Go into the project folder
cd Cognee-Chat-v2.0
```

> 📁 The project folder is now at `Cognee-Chat-v2.0/` on your computer.

---

### 🐍 Step 2: Set Up the Backend (Python)

The backend is the "brain" — it processes text and answers your questions.

```bash
# Create a virtual environment (a safe sandbox for Python packages)
python -m venv venv

# Activate it:
# ── Windows ──
.\venv\Scripts\Activate.ps1

# ── Mac / Linux ──
source venv/bin/activate

# Install all required Python packages
pip install -r requirements.txt

# Start the backend!
python start_backend.py
```

> ✅ **Done right?** You'll see something like: `Uvicorn running on http://127.0.0.1:8000`  
> The backend writes a `.port` file so the frontend knows where to find it automatically.

> ⏳ **First time?** `pip install` might take 2-3 minutes. That's normal.

> ❌ **Error about `python` not found?** Try `python3` instead.

---

### 🌐 Step 3: Set Up the Frontend (Web App)

**Open a brand new terminal window** (keep the backend running in the first one).

```bash
# Go into the app folder
cd Cognee-Chat-v2.0/app

# Install frontend packages
npm install

# Start the dev server
npm run dev
```

> ✅ **Done right?** Open your browser and go to **http://localhost:3000**  
> You should see the dark-mode Cognee Chat interface!

> ⏳ **First time?** `npm install` might take 1-2 minutes.

---

### 👟 Step 4: Test It Out

1. Open **http://localhost:3000** in your browser
2. Click **Ingest** in the sidebar (📥 icon)
3. Paste some text like: *"Albert Einstein was a physicist. He developed the theory of relativity. Marie Curie was a chemist who discovered radium."*
4. Click **Ingest Text** and wait a few seconds
5. Click **Graph** (🔗 icon) — you should see nodes and connections
6. Click **Chat** (💬 icon) and ask: *"What did Einstein do?"*
7. The AI will answer using your knowledge graph!

---

## 📁 Project Map

```
Cognee-Chat-v2.0/
├── .env                    ← Your API keys (keep secret!)
├── .env.example            ← Shows what .env should look like
├── requirements.txt        ← What Python packages to install
├── api.py                  ← Backend code (FastAPI)
├── start_backend.py        ← Starts the backend for you
│
├── app/                    ← The web app (Next.js)
│   ├── package.json        ← What npm packages to install
│   ├── next.config.ts      ← Next.js settings
│   │
│   ├── lib/
│   │   ├── api.ts          ← Talks to the backend
│   │   └── db.ts           ← Saves chat sessions
│   │
│   ├── app/                ← All the pages
│   │   ├── layout.tsx      ← Main layout (sidebar + page)
│   │   ├── sidebar.tsx     ← Navigation menu
│   │   ├── chat/page.tsx   ← Chat with AI
│   │   ├── graph/page.tsx  ← See the knowledge graph
│   │   ├── ingest/page.tsx ← Upload text/files
│   │   └── settings/page.tsx ← Settings & theme
│   │
│   ├── api/                ← Backend-for-frontend routes
│   │   ├── port/           ← Reads the port file
│   │   └── sessions/       ← Saves your chat history
│   │
│   └── data/
│       └── cognee.db       ← Your chat history (SQLite)
│
└── venv/                   ← Python virtual environment
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=sk-your-key-here
LLM_MODEL=openrouter/meta-llama/llama-3.1-8b-instruct
GRAPH_PROVIDER=kuzu
COGNEE_WIPE_DB_ON_STARTUP=true
```

> 🔑 **Get an API key:** Sign up at [OpenRouter](https://openrouter.ai) and create a key.

### Available LLM Models

You can change the model in Settings → LLM Model:

| Model | Provider | Cost |
|-------|----------|------|
| Llama 3.1 8B | OpenRouter | Free / Cheap |
| Llama 3.1 70B | OpenRouter | Moderate |
| Claude 3.5 Sonnet | OpenRouter | Higher |
| GPT-4o | OpenRouter | Higher |
| Gemini 2.0 Flash | OpenRouter | Cheap |

---

## 🧩 Tech Stack

| What | Technology |
|------|-----------|
| 🎨 UI | Next.js 16, Tailwind CSS v4, React 19 |
| 🔗 Graph | React Flow 11 + dagre |
| 💾 Sessions | better-sqlite3 (direct) |
| ⚙️ Backend | FastAPI + Uvicorn |
| 🧠 AI Memory | Cognee 1.2.2 (graph-RAG) |
| 🤖 LLM | LiteLLM + OpenRouter |
| 📐 Embeddings | FastEmbed (BAAI/bge-small-en-v1.5) |
| 🕸️ Graph DB | Kuzu |

---

## 📄 License

MIT — see [LICENSE](LICENSE).
