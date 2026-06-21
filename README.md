# DermaVision

DermaVision is an AI-assisted dermatology web platform for skin image analysis, educational RAG chat, and patient-friendly consultation reports.

The system is built as two apps:

- `Derma-back-main` - FastAPI backend, SQLite database, ML inference, auth, history, family members, password reset, RAG, and report APIs.
- `Derma-front-main` - React/Vite frontend with Arabic/English support, diagnosis upload flow, result reports, history, dashboard, and chat UI.

## Features

- Skin image diagnosis with an EfficientNet-B4 model
- JWT authentication
- Signup, login, profile, change password, forgot/reset password via SMTP
- Diagnosis history and diagnosis-by-ID reports
- Family member support
- RAG assistant grounded in `skin_data1.txt`
- Optional Groq, xAI, or OpenAI generation
- Safe local fallback when no LLM key is configured
- Multi-intent Arabic/English chat handling
- Preliminary diagnosis PDF/basic report
- Consultation report after chat
- Deterministic medical safety guardrails and disease profiles

## Architecture

- Frontend: React, Vite, Axios, React Router, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Alembic, SQLite
- ML: PyTorch, timm, EfficientNet-B4
- RAG: local knowledge file, chunking, retrieval, deterministic safety profiles, optional provider strategy for Groq/xAI/OpenAI
- Backend structure follows service/repository style boundaries:
  - API endpoints under `app/api/v1/endpoints`
  - domain services under `app/domain/services`
  - database models/repositories under `app/infrastructure/database`
  - ML and RAG infrastructure under `app/infrastructure`

## Folder Structure

```text
.
├── Derma-back-main/
│   ├── app/
│   ├── alembic/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── README.md
├── Derma-front-main/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── README.md
├── docker-compose.yml
└── README.md
```

## Run With Docker

From this parent folder:

```powershell
docker compose up --build
```

Then open:

- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000/api/v1`
- Swagger docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/api/v1/health`

The Docker setup uses named volumes for:

- SQLite database at `/app/data/skin_analysis.db`
- uploaded images at `/app/uploads`
- generated RAG vector index at `/app/app/data/rag/vector_index`

Stop containers:

```powershell
docker compose down
```

Remove local Docker data volumes if you want a fresh demo database:

```powershell
docker compose down -v
```

## Run Without Docker

### Backend

```powershell
cd Derma-back-main
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```powershell
cd Derma-front-main
npm install
npm run dev
```

Frontend dev URL:

```text
http://localhost:5173
```

## Environment Variables

Never commit real `.env` files or secrets.

Backend local config should be copied from:

```text
Derma-back-main/.env.example
```

Frontend local config should be copied from:

```text
Derma-front-main/.env.example
```

Important variables:

```env
# Frontend
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1

# Backend
DATABASE_URL=sqlite:///./skin_analysis.db
MODEL_PATH=./app/infrastructure/ml/weights/skin_efficientnet_b4_9.pth
RAG_KNOWLEDGE_PATH=./app/data/rag/skin_data1.txt
RAG_LLM_PROVIDER=
GROQ_API_KEY=
XAI_API_KEY=
OPENAI_API_KEY=
SMTP_PASSWORD=
SECRET_KEY=replace-with-a-strong-random-secret
```

Leave `RAG_LLM_PROVIDER` and all LLM keys empty to use the safe local fallback.

Supported optional providers:

```env
RAG_LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key
RAG_LLM_MODEL=llama-3.1-8b-instant
```

```env
RAG_LLM_PROVIDER=xai
XAI_API_KEY=your_xai_key
RAG_LLM_MODEL=grok-4.3
```

```env
RAG_LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
RAG_LLM_MODEL=gpt-4o-mini
```

## Model Weights

The backend expects:

```text
Derma-back-main/app/infrastructure/ml/weights/skin_efficientnet_b4_9.pth
```

The current local model file is about 67.7 MiB. It is below GitHub's hard 100 MiB file limit, but above the 50 MiB warning threshold. Git LFS or external model storage is recommended for long-term sharing.

## RAG Knowledge Base

The RAG knowledge file should exist at:

```text
Derma-back-main/app/data/rag/skin_data1.txt
```

The generated vector index/cache lives under:

```text
Derma-back-main/app/data/rag/vector_index/
```

That generated directory is ignored by Git and Docker build context.

## Security Notes

- Do not commit `.env`, `.env.local`, API keys, SMTP passwords, JWT tokens, or local databases.
- Use a strong `SECRET_KEY` in production.
- Set `AUTH_REQUIRED=True` in production.
- Do not use wildcard CORS in production.
- Use HTTPS for deployed frontend/backend.
- Keep private Groq, xAI, OpenAI, and SMTP keys only on the backend.

## Screenshots

Add screenshots here before publishing if desired:

```text
docs/screenshots/home.png
docs/screenshots/result.png
docs/screenshots/chat.png
```

## Medical Disclaimer

DermaVision is for educational and assistive purposes only. It is not a medical device, final diagnosis, or personal prescription. Users should consult a qualified dermatologist for diagnosis, treatment, and urgent symptoms.
