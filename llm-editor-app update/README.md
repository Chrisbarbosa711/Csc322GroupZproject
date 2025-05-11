# LLM Editor App

A collaborative text editor application that utilizes the GECToR grammar error correction model to provide real-time grammar correction for text input.

## Main Features

- Real-time collaborative text editing
- Grammar error correction using the GECToR model
- User authentication and document management
- Markdown support with live preview
- Chat functionality for collaborative editing

## Project Structure

- `app/` - Frontend React application
- `backend/` - FastAPI backend server
- `gector-api/` - Grammar error correction API using GECToR model

## Installation and Running

### Frontend

```bash
cd app
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### GECToR API

```bash
cd gector-api
chmod +x docker-run.sh
./docker-run.sh
```
## Technology Stack

- **Frontend**: React, Tailwind, React Query, Axios, Shadcn UI
- **Backend**: FastAPI
- **GECToR API**: PyTorch, Transformers, FastAPI
- **Database**: MySQL 