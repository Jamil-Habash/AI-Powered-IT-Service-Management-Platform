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

## Deploy to Azure

This deploys the same containers to Azure Container Apps (ACA), backed by Azure Database for MySQL Flexible Server, using Azure Container Registry (ACR) to host images.

### 1. Prerequisites

```powershell
az login
az group create -n smartdesk-rg -l eastus
az extension add --name containerapp --upgrade
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
```

### 2. Build and push images to ACR

```powershell
az acr create -n smartdeskacr -g smartdesk-rg --sku Basic --admin-enabled true
az acr login -n smartdeskacr

docker build -t smartdeskacr.azurecr.io/smartdesk-backend:latest ./backend
docker build -t smartdeskacr.azurecr.io/smartdesk-frontend:latest ./frontend

docker push smartdeskacr.azurecr.io/smartdesk-backend:latest
docker push smartdeskacr.azurecr.io/smartdesk-frontend:latest
```

### 3. Provision Azure Database for MySQL

```powershell
az mysql flexible-server create `
  -g smartdesk-rg -n smartdesk-mysql `
  --admin-user smartdeskadmin --admin-password "<strong-password>" `
  --sku-name Standard_B1ms --tier Burstable `
  --version 8.0 --storage-size 32 --public-access None

az mysql flexible-server db create -g smartdesk-rg -s smartdesk-mysql -d smartdesk
```

Use a VNet-integrated Container Apps environment (or a private endpoint) so the backend can reach the database privately; otherwise allow ACA's outbound IPs via firewall rules.

### 4. Create the Container Apps environment

```powershell
az containerapp env create -n smartdesk-env -g smartdesk-rg -l eastus
```

### 5. Deploy the backend (internal ingress only)

```powershell
az containerapp create `
  -n smartdesk-backend -g smartdesk-rg --environment smartdesk-env `
  --image smartdeskacr.azurecr.io/smartdesk-backend:latest `
  --registry-server smartdeskacr.azurecr.io `
  --target-port 8080 --ingress internal `
  --min-replicas 1 --max-replicas 3 `
  --secrets db-password="<strong-password>" jwt-secret="<64-char-secret>" groq-key="<key>" gmail-pass="<app-password>" `
  --env-vars `
    SPRING_PROFILES_ACTIVE=prod `
    DB_URL="jdbc:mysql://smartdesk-mysql.mysql.database.azure.com:3306/smartdesk?useSSL=true" `
    DB_USERNAME=smartdeskadmin `
    DB_PASSWORD=secretref:db-password `
    APP_FRONTEND_URL="https://<frontend-fqdn>" `
    JWT_SECRET=secretref:jwt-secret `
    GROQ_API_KEY=secretref:groq-key `
    GMAIL_USERNAME="<gmail-account>" `
    GMAIL_APP_PASSWORD=secretref:gmail-pass
```

### 6. Deploy the frontend (external ingress)

Apps within the same Container Apps environment resolve each other by app name, so point the frontend's proxy at the backend app name via `BACKEND_HOST`:

```powershell
az containerapp create `
  -n smartdesk-frontend -g smartdesk-rg --environment smartdesk-env `
  --image smartdeskacr.azurecr.io/smartdesk-frontend:latest `
  --registry-server smartdeskacr.azurecr.io `
  --target-port 80 --ingress external `
  --min-replicas 1 --max-replicas 3 `
  --env-vars BACKEND_HOST=smartdesk-backend BACKEND_PORT=8080
```

Container Apps issues a public HTTPS FQDN with a managed certificate automatically:

```powershell
az containerapp show -n smartdesk-frontend -g smartdesk-rg --query properties.configuration.ingress.fqdn -o tsv
```

Update the backend's `APP_FRONTEND_URL` env var to that FQDN (or your custom domain) once known, then restart the backend revision.

### 7. Custom domain (optional)

```powershell
az containerapp hostname add -n smartdesk-frontend -g smartdesk-rg --hostname yourdomain.com
az containerapp hostname bind -n smartdesk-frontend -g smartdesk-rg --hostname yourdomain.com
```

### 8. Redeploying after changes

```powershell
docker build -t smartdeskacr.azurecr.io/smartdesk-backend:latest ./backend
docker push smartdeskacr.azurecr.io/smartdesk-backend:latest
az containerapp update -n smartdesk-backend -g smartdesk-rg --image smartdeskacr.azurecr.io/smartdesk-backend:latest
```
