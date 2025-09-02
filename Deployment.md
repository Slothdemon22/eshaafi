# Eshaafi Simple Deployment Guide

Quick deployment guide for the **Eshaafi** application using Docker Compose.

---

## Files Needed

### 1. `.env` file
```env
# Postgres
POSTGRES_USER=eshaafi_user
POSTGRES_PASSWORD=P@ssw0rd123!
POSTGRES_DB=eshaafi_db

# Backend
DATABASE_URL=postgresql://eshaafi_user:P@ssw0rd123!@postgres:5432/eshaafi_db
BASE_URL=http://192.168.1.100:5000
JWT_SECRET=my-super-secret-jwt-key-that-is-very-long-and-secure-32chars
JWT_EXPIRES_IN=1h
HMS_ACCESS_KEY=abc123def456ghi789
HMS_SECRET=xyz987uvw654rst321
HMS_MANAGEMENT_TOKEN=mgmt_1234567890abcdef
HMS_TEMPLATE_ID=template_abcd1234efgh5678
ADMIN_EMAIL=admin@eshaafi.com
ADMIN_PASSWORD=AdminPass123!
SUPER_ADMIN_EMAIL=superadmin@eshaafi.com
SUPER_ADMIN_PASSWORD=SuperAdminPass123!

# Frontend
NEXT_PUBLIC_HMS_SUBDOMAIN=eshaafi.app.100ms.live
NEXT_PUBLIC_BACKEND_URI=http://192.168.1.100:5000
```

### 2. `docker-compose.yml` file
```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    container_name: eshaafi_db
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    image: bacillus/eshaafi-backend:latest
    container_name: eshaafi_backend
    restart: always
    depends_on:
      - postgres
    environment:
      DATABASE_URL: ${DATABASE_URL}
      BASE_URL: ${BASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      HMS_ACCESS_KEY: ${HMS_ACCESS_KEY}
      HMS_SECRET: ${HMS_SECRET}
      HMS_MANAGEMENT_TOKEN: ${HMS_MANAGEMENT_TOKEN}
      HMS_TEMPLATE_ID: ${HMS_TEMPLATE_ID}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      SUPER_ADMIN_EMAIL: ${SUPER_ADMIN_EMAIL}
      SUPER_ADMIN_PASSWORD: ${SUPER_ADMIN_PASSWORD}
    ports:
      - "5000:5000"

  frontend:
    image: bacillus/eshaafi-frontend:latest
    container_name: eshaafi_frontend
    restart: always
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_HMS_SUBDOMAIN: ${NEXT_PUBLIC_HMS_SUBDOMAIN}
      NEXT_PUBLIC_BACKEND_URI: ${NEXT_PUBLIC_BACKEND_URI}
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

---

## Deployment Steps

### Step 1: Setup
```bash
# Create deployment folder
mkdir eshaafi-deployment
cd eshaafi-deployment

# Create .env file (copy content from above)
nano .env

# Create docker-compose.yml file (copy content from above)  
nano docker-compose.yml

# Your folder should now have:
# eshaafi-deployment/
# ├── .env
# └── docker-compose.yml

# Edit .env with your actual server IP and credentials
```

### Step 2: Deploy
```bash
# Pull images
docker-compose pull

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### Step 3: Verify
```bash
# Check logs
docker-compose logs

# Test frontend: http://your_server_ip:3000
# Test backend: http://your_server_ip:5000
```

---

## Basic Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Update
docker-compose pull && docker-compose up -d

# Clean up everything
docker-compose down -v
docker system prune -f
```

That's it!