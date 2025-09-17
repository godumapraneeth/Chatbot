# Chatbot (MERN + Gemini)

Modern AI chat app with PDF upload and contextual Q&A.

## Features
- JWT auth (login/register)
- Chat with Gemini 1.5 Flash
- Upload PDFs to Cloudinary and query content
- Saved chat history per user
- Polished UI with Tailwind classes

## Monorepo Layout
- `backend/`: Express, MongoDB, Cloudinary, Gemini
- `frontend/`: React + Vite

## Prerequisites
- Node.js 18+
- MongoDB Atlas (or local)
- Cloudinary account
- Gemini API key

## Environment Variables
Copy and edit examples:
- Backend: `backend/ENV.EXAMPLE.txt` → create `backend/.env`
- Frontend: `frontend/ENV.EXAMPLE.txt` → create `frontend/.env`

Backend `.env` keys:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Frontend `.env` keys:
- `VITE_API_URL` e.g. `http://localhost:5000/api`

## Local Development
### Backend
```
cd backend
npm i
npm run dev
```
- Runs on `http://localhost:5000`

### Frontend
```
cd frontend
npm i
npm run dev
```
- Runs on `http://localhost:5173`

Ensure CORS origin in `backend/server.js` matches the frontend URL.

## API Overview
- `POST /api/auth/register` { name, email, password }
- `POST /api/auth/login` { email, password } → { token }
- `GET /api/chat` (auth) → { messages }
- `POST /api/chat` (auth) { message }
- `POST /api/pdf/upload` (auth, multipart) field: `pdf`
- `GET /api/pdf/list` (auth) → [ { originalName, cloudinaryPublicId, url, uploadDate } ]
- `POST /api/pdf/query` (auth) { question, pdfId? } → { answer }
- `DELETE /api/pdf/delete/:publicId` (auth)

## Deploy Notes
- Keep `.env` out of Git; examples are provided.
- On cloud platforms, set env vars in the service dashboard.
- For frontend, set `VITE_API_URL` to your deployed backend URL.

## License
MIT


