# InterviewPrep — Frontend

Vite + React + Tailwind + shadcn/ui + Vapi Web SDK. Provided as-is for students; calls the backend REST API.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — VITE_API_URL, VITE_VAPI_WEB_TOKEN
```

Start the **backend** first (see `../backend/README.md`).

## Run

```bash
npm run dev
```

UI: http://localhost:5173

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
