# DermaVision Backend

FastAPI backend for DermaVision, an AI-assisted dermatology platform. It handles authentication, image upload validation, ML skin disease prediction, diagnosis history, family members, password reset email flow, RAG chat, and consultation report generation.

The ML model predicts the supported skin class. RAG and deterministic disease profiles explain the result for educational use.

## Tech Stack

- FastAPI
- SQLAlchemy async ORM
- Alembic
- SQLite for local/demo use
- PyTorch, torchvision, timm, EfficientNet-B4
- JWT authentication
- SMTP password reset
- Local RAG retrieval with optional Groq/xAI/OpenAI generation

## Main Features

- Signup/login and JWT-protected APIs
- Forgot/reset password with hashed single-use reset tokens
- Skin image diagnosis upload
- JPG, JPEG, PNG validation with 10MB limit
- Diagnosis history and diagnosis by ID
- Family members
- RAG assistant under `/api/v1/rag/chat`
- Consultation report API under `/api/v1/rag/final-report`
- Safe local RAG fallback when no LLM key is configured
- Rate limiting, upload safety, CORS config, and security headers

## Supported Model Classes

- Urticaria
- Tinea Circinata
- Annular Lichen
- Psoriasis
- Mycosis Fungoides / MF
- Healthy

The trained model may use the raw label `healty` internally for healthy skin. Do not change raw model labels unless the model is retrained.

## API Base

Local backend:

```text
http://127.0.0.1:8000
```

API prefix:

```text
/api/v1
```

Docs and checks:

- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/api/v1/health`
- Ready: `http://127.0.0.1:8000/api/v1/ready`

## Important Endpoints

- `GET /api/v1/health`
- `GET /api/v1/ready`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/diagnosis`
- `GET /api/v1/diagnosis/{analysis_id}`
- `GET /api/v1/history`
- `POST /api/v1/rag/chat`
- `POST /api/v1/rag/final-report`

## Local Setup Without Docker

### 1. Create a virtual environment

```powershell
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Configure environment

```powershell
copy .env.example .env
```

Edit `.env` locally. Do not commit it.

### 4. Add model weights

Place the model file here:

```text
app/infrastructure/ml/weights/skin_efficientnet_b4_9.pth
```

Expected setting:

```env
MODEL_PATH=./app/infrastructure/ml/weights/skin_efficientnet_b4_9.pth
```

### 5. Run migrations

```powershell
alembic upgrade head
```

The app also creates missing tables on startup for local development, but Alembic is the preferred reproducible path.

### 6. Start backend

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If port 8000 is busy on Windows:

```powershell
netstat -ano | findstr :8000
```

Stop the conflicting process or temporarily choose another port and update the frontend `VITE_API_BASE_URL`.

## Docker Backend Run

From this backend folder:

```powershell
docker compose up --build
```

Or from the parent project folder:

```powershell
docker compose up --build backend
```

The container exposes:

```text
http://127.0.0.1:8000
```

Docker volumes persist:

- SQLite demo DB: `/app/data/skin_analysis.db`
- uploads: `/app/uploads`
- RAG vector index: `/app/app/data/rag/vector_index`

## Environment Variables

Use `.env.example` as the template. Use placeholders only in committed files.

Core local values:

```env
ENVIRONMENT=development
DEBUG=False
DATABASE_URL=sqlite:///./skin_analysis.db
SECRET_KEY=replace-with-a-strong-random-secret-minimum-32-characters
AUTH_REQUIRED=True
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","https://frontai.vercel.app"]
UPLOAD_DIR=./uploads
MODEL_PATH=./app/infrastructure/ml/weights/skin_efficientnet_b4_9.pth
MODEL_DEVICE=cpu
RAG_KNOWLEDGE_PATH=./app/data/rag/skin_data1.txt
RAG_VECTOR_INDEX_DIR=./app/data/rag/vector_index
```

SMTP password reset:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@example.com
SMTP_PASSWORD=your_app_password_here
SMTP_FROM_EMAIL=your_email@example.com
SMTP_USE_TLS=true
FRONTEND_BASE_URL=http://localhost:5173
FRONTEND_RESET_PASSWORD_URL=http://localhost:5173/reset-password
```

For Gmail, use a Gmail App Password, not the normal Gmail account password.

## RAG Provider Configuration

Leave provider and keys empty to use the safe local fallback:

```env
RAG_LLM_PROVIDER=
OPENAI_API_KEY=
XAI_API_KEY=
GROQ_API_KEY=
```

Groq:

```env
RAG_LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key
GROQ_BASE_URL=https://api.groq.com/openai/v1
RAG_LLM_MODEL=llama-3.1-8b-instant
```

xAI:

```env
RAG_LLM_PROVIDER=xai
XAI_API_KEY=your_xai_key
XAI_BASE_URL=https://api.x.ai/v1
RAG_LLM_MODEL=grok-4.3
```

OpenAI:

```env
RAG_LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
RAG_LLM_MODEL=gpt-4o-mini
```

Never put LLM keys in the frontend.

## RAG Knowledge Base

Required file:

```text
app/data/rag/skin_data1.txt
```

Generated index/cache:

```text
app/data/rag/vector_index/
```

The generated index is ignored by Git and rebuilt automatically when needed.

## Model Weight Notes

Current expected weight:

```text
app/infrastructure/ml/weights/skin_efficientnet_b4_9.pth
```

Local size observed: about 67.7 MiB. This is below GitHub's 100 MiB hard limit but above the 50 MiB warning threshold. Git LFS or an external model download step is recommended for long-term GitHub sharing.

## Database

Default local database:

```env
DATABASE_URL=sqlite:///./skin_analysis.db
```

SQLite is fine for local demo. PostgreSQL is recommended for production.

## Security Notes

- `.env` must not be committed.
- Use a strong unique `SECRET_KEY`.
- Set `AUTH_REQUIRED=True` in production.
- Do not use wildcard CORS in production.
- Do not log or commit SMTP, Groq, xAI, OpenAI, or JWT secrets.
- Keep uploads and local DB files out of Git.
- Use HTTPS in production.

If a secret file was already tracked:

```powershell
git rm --cached .env
```

## Medical Disclaimer

DermaVision provides AI-assisted educational information only. It is not a final medical diagnosis, medical device, or personal prescription. A qualified dermatologist should confirm diagnosis and treatment.
