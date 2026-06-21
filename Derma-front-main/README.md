# DermaVision Frontend

React/Vite frontend for DermaVision, an AI-assisted dermatology web app. It provides the user interface for signup/login, skin image upload, diagnosis reports, dashboard/history, RAG chat, and consultation report generation.

## Tech Stack

- React
- Vite
- Axios
- React Router
- Tailwind CSS
- Arabic/English localization
- nginx for Docker production serving

## Main Pages and Features

- Home page with Arabic/English and dark/light support
- Sign up and sign in
- Forgot password and reset password
- Upload image diagnosis flow
- Diagnosis result page with basic/preliminary PDF export
- Dashboard and history
- RAG chat page
- Consultation report generation after chat
- RTL handling for Arabic

## Backend Requirement

The backend must be running for auth, diagnosis, history, password reset, RAG chat, and report flows.

Default backend:

```text
http://127.0.0.1:8000
```

Default API base:

```text
http://127.0.0.1:8000/api/v1
```

## Environment Variables

Create local `.env.local` if needed:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

The committed `.env.example` contains safe placeholder/default values only.

Do not commit:

- `.env`
- `.env.local`
- real Firebase values if private
- any backend, SMTP, Groq, xAI, or OpenAI secrets

## Local Setup Without Docker

### 1. Install dependencies

```powershell
npm install
```

### 2. Start dev server

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

Restart the Vite dev server after changing `.env.local`; Vite reads env files at startup.

### 3. Build

```powershell
npm run build
```

The generated `dist/` folder is build output and should not be committed.

## Docker Frontend Run

From this frontend folder:

```powershell
docker build --build-arg VITE_API_BASE_URL=http://localhost:8000/api/v1 -t dermavision-frontend .
docker run --rm -p 5173:80 dermavision-frontend
```

From the parent project folder, run both frontend and backend:

```powershell
docker compose up --build
```

Then open:

```text
http://localhost:5173
```

## Docker Environment Note

`VITE_API_BASE_URL` is baked into the static frontend during `npm run build`. For Docker/nginx, set it as a build arg:

```powershell
docker build --build-arg VITE_API_BASE_URL=https://your-backend-domain.com/api/v1 -t dermavision-frontend .
```

For local Docker Compose, the browser still calls the backend through the host-mapped port:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Report Flows

- Diagnosis result page: downloads/prints the basic preliminary diagnosis report already shown on the page.
- Chat page: generates a consultation report from diagnosis context plus the chat messages.

Neither report is a final medical diagnosis or personal prescription.

## GitHub Safety

Ignored local/generated files include:

- `.env`
- `.env.local`
- `node_modules/`
- `dist/`
- `build/`
- `.vite/`
- `*.log`
- `.DS_Store`

If a secret file was already tracked:

```powershell
git rm --cached .env
git rm --cached .env.local
```

## Deployment Notes

- Build with the production backend API URL.
- Ensure backend CORS allows the deployed frontend origin.
- Do not expose backend-only secrets in frontend env.
- nginx serves the built SPA and falls back to `index.html` for React Router routes.

## Medical Disclaimer

DermaVision provides preliminary AI-assisted information for educational and assistive purposes only. It does not replace a dermatologist, professional medical diagnosis, or treatment advice.
