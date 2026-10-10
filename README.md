# DefiOra

DefiOra is an AI-powered pre-submission security layer: it extracts claims from an application and supporting evidence, compares those claims deterministically, traces findings to their sources, and tells a human what to review before submitting.

## Project structure

- `Frontend/` — Next.js UI and presentation components.
- `Backend/` — FastAPI API, Gemini extraction, normalization, verification, scoring, evidence graph, and tests.

The backend is the source of truth for analysis. Gemini only extracts structured claims; Python rules compare claims and calculate the report.

## Run locally

Terminal 1 — backend:

```powershell
cd C:\Users\SAMRIDHI\PycharmProjects\DefiOra
python -m venv Backend/.venv
Backend/.venv/Scripts/Activate.ps1
python -m pip install -r Backend/requirements.txt
Copy-Item Backend/.env.example Backend/.env
python -m uvicorn Backend.main:app --reload --port 8000
```

Put the server-side `GEMINI_API_KEY` in `Backend/.env` for live document analysis. The synthetic demo endpoint works without a key.

Terminal 2 — frontend:

```powershell
cd C:\Users\SAMRIDHI\PycharmProjects\DefiOra\Frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:8000`. To override it, create `Frontend/.env.local` from `Frontend/.env.example` and set `NEXT_PUBLIC_BACKEND_URL` to the FastAPI URL. This variable contains only the backend URL, never the Gemini key.

## Demo flow

Open `http://localhost:3000`, choose **Check my application**, then choose **Load demo case** and **Analyze my application**. The synthetic case contains an intentional date-of-birth difference and should produce a deterministic `70 / 100` report with `REVIEW REQUIRED`, a conflict in the Evidence Graph, and a review checklist.

## Safety

The prototype should use synthetic data during demos. Do not upload real identity documents. DefiOra does not claim fraud, document authenticity, government verification, or trusted portal verification.

