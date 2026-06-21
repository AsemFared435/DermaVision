# DermaVision Frontend Integration Guide

This guide documents the current backend/frontend local integration contract.

## Local Backend URLs

Normal local backend command:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Local backend can be reached at:

- `http://127.0.0.1:8000`
- `http://localhost:8000`

API prefix:

```text
/api/v1
```

Frontend API base environment variable:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Use only `VITE_API_BASE_URL` in frontend code and docs.

If port 8000 is unavailable on Windows, check the process:

```powershell
netstat -ano | findstr :8000
```

Stop the conflicting process if appropriate, or temporarily run the backend on another port such as 8001 and update local `.env.local`. Port 8000 remains the normal default.

## CORS

Backend CORS should allow:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `https://frontai.vercel.app`

Restart the backend after changing `CORS_ORIGINS`.

## Axios Client

Recommended frontend API client:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

Because the base URL already includes `/api/v1`, service calls should use paths such as:

```javascript
api.post('/auth/login', payload);
api.post('/diagnosis', formData);
api.get('/history');
api.get(`/diagnosis/${analysisId}`);
```

## Auth Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/change-password`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Protected requests should include:

```text
Authorization: Bearer <access_token>
```

## Diagnosis Upload

Endpoint:

```text
POST /diagnosis
```

Request type:

```text
multipart/form-data
```

Form field:

```text
file
```

Allowed upload formats:

- JPG
- JPEG
- PNG

Maximum upload size:

```text
10MB
```

Frontend file validation example:

```javascript
const validTypes = ['image/jpeg', 'image/png'];

if (!validTypes.includes(selected.type)) {
  setError('Please select a JPG, JPEG, or PNG image');
  return;
}
```

Input accept attribute:

```jsx
<input type="file" accept=".jpg,.jpeg,.png" />
```

## Diagnosis Response Contract

Example `POST /diagnosis` response:

```json
{
  "predicted_label": "psoriasis",
  "confidence": 0.92,
  "top_k": [
    { "label": "psoriasis", "confidence": 0.92 },
    { "label": "tinea circinata", "confidence": 0.05 }
  ],
  "image_quality_score": 85,
  "image_quality_label": "Good",
  "analysis_id": 123
}
```

Frontend display rules:

- `confidence` is `0` to `1`, display as `confidence * 100`.
- `image_quality_score` is already `0` to `100`, do not multiply it by 100.

## History and Reports

History endpoint:

```text
GET /history
```

Diagnosis by ID endpoint:

```text
GET /diagnosis/{analysis_id}
```

Result pages should include the analysis ID in the URL when possible:

```text
/result?id=123
```

If route state is lost on refresh, the frontend should call:

```text
GET /diagnosis/{analysis_id}
```

## Health Checks

Backend health:

```powershell
curl http://127.0.0.1:8000/api/v1/health
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Integration Checklist

- [ ] Backend is running on `127.0.0.1:8000`.
- [ ] Frontend `.env.local` uses `VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1`.
- [ ] Frontend uses `VITE_API_BASE_URL`.
- [ ] Upload UI allows only JPG, JPEG, PNG.
- [ ] No frontend request defaults to port 8001.
- [ ] CORS includes the frontend dev origin.
