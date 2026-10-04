# 🌐 Deployment Guide: Vercel & Render

This guide outlines step-by-step instructions for deploying the **Smart Log Analyzer** project:
- **Frontend**: Vercel (Single-Page Dashboard)
- **Backend**: Render (Java Spring Boot Docker Container)
- **Database**: Supabase PostgreSQL

---

## 1. Backend Deployment on Render

1. Connect your GitHub repository to **Render**.
2. Select **New Web Service** and choose **Blueprint** or **Docker Service**.
3. Set the directory context:
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
4. Configure Environment Variables in Render Dashboard:
   - `PORT`: `8080`
   - `FRONTEND_URL`: `https://YOUR-VERCEL-APP.vercel.app`
   - `SUPABASE_DB_URL`: `jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require`
   - `SUPABASE_DB_USER`: `postgres.YOUR_PROJECT_REF`
   - `SUPABASE_DB_PASSWORD`: `YOUR_SUPABASE_PASSWORD`

Render will compile the Java 17 Spring Boot JAR inside the Docker builder container and expose the API at `https://YOUR-RENDER-APP.onrender.com`.

---

## 2. Frontend Deployment on Vercel

1. Connect your GitHub repository to **Vercel**.
2. Create a **New Project** and configure settings:
   - **Framework Preset**: `Other` / `Static Site`
   - **Root Directory**: `frontend`
3. Add Environment Variable in Vercel Dashboard:
   - `VITE_API_BASE_URL`: `https://YOUR-RENDER-APP.onrender.com`
4. Deploy!

Vercel will deploy your high-performance static UI and connect it to your Render backend API.

---

## 3. Local Development Architecture

- **Backend**:
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```
  Runs at `http://localhost:8080`.

- **Frontend**:
  Open `frontend/index.html` directly in browser or serve via static HTTP server on `http://localhost:3000` / `http://localhost:5173`.
