# DefiOra FastAPI backend

This directory is the source of truth for DefiOra's document-analysis pipeline. The Next.js application in `../Frontend` is presentation-only and calls this service over HTTP.

## Setup

From the repository root:

```powershell
python -m venv Backend/.venv
Backend/.venv/Scripts/Activate.ps1
python -m pip install -r Backend/requirements.txt
Copy-Item Backend/.env.example Backend/.env
```

Set `GEMINI_API_KEY` in `Backend/.env`. Never expose that value to the browser or commit the file.

## Run

```powershell
python -m uvicorn Backend.main:app --reload --port 8000
```

The service exposes `GET /health`, `GET /api/demo`, and `POST /api/analyze`.

## Test

```powershell
python -m pytest Backend/tests -q
```

The tests exercise deterministic normalization, verification, scoring, graph generation, the demo endpoint, and controlled input errors. They do not require a Gemini key.

