# SmartDesk Deployment

## Prerequisites

- Docker Desktop with Docker Compose v2
- A Groq API key and SMTP credentials

## Start the stack

1. Copy `.env.example` to `.env` at the repository root.
2. Replace every placeholder with a unique production value. Use a randomly generated 64-character `JWT_SECRET` and strong database passwords.
3. Start the services:

```powershell
docker compose up -d --build
```

The frontend is available at `http://localhost` by default. It proxies `/api` to the private backend container; MySQL and the backend are not exposed directly to the host.

## Operations

```powershell
docker compose ps
docker compose logs -f backend
docker compose down
```

Set `APP_PORT` and `APP_FRONTEND_URL` in `.env` when deploying behind a different public address. The first startup creates or updates the schema because the project does not yet include database migration scripts.
