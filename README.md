# 🛡️ Smart Log Analyzer (Enterprise Edition)

[![Java 17](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot 3.4](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-blue.svg)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Backend-Render-black.svg)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black.svg)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

A production-ready enterprise security log parsing and threat analysis application built with **Java 17**, **Spring Boot 3.4**, **Spring Security**, **Spring Data JPA**, **Supabase PostgreSQL**, **Swagger/OpenAPI 3**, **Docker**, and a modern **Glassmorphic Single-Page Dashboard UI**.

---

## 🏗️ Reorganized Deployment Structure

The repository is organized into a clean, decoupled structure optimized for separate cloud deployment:

- **Frontend (`frontend/`)**: Deployed on **Vercel** (Vanilla HTML5 / CSS3 / ES6+ JS single-page web dashboard).
- **Backend (`backend/`)**: Deployed on **Render** (Java 17 Spring Boot REST application inside Docker).
- **Database**: **Supabase PostgreSQL** persistent database.

```
smart-log-analyzer-java/
├── frontend/                 # Vercel Frontend
│   ├── index.html
│   ├── script.js             # Dynamic VITE_API_BASE_URL integration
│   ├── style.css             # Minimalist glassmorphic styling
│   ├── vercel.json           # Vercel routing configuration
│   └── .env.example
├── backend/                  # Render Backend (Spring Boot)
│   ├── src/
│   │   ├── main/java/com/sohel/loganalyzer/
│   │   └── resources/
│   ├── pom.xml
│   ├── Dockerfile            # Multi-stage Java 17 Docker build
│   ├── mvnw
│   └── .env.example
├── docs/                     # Architectural & Deployment Specs
│   ├── architecture.md
│   ├── api.md
│   ├── log-formats.md
│   └── deployment.md
├── render.yaml               # Render Blueprint configuration
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🌟 Executive Summary & Features

**Smart Log Analyzer** parses system log files (`.log`, `.txt`, `.out`), detects operational errors and security authentication failures (e.g. brute-force SSH attacks), calculates threat risk levels for suspicious IP addresses, and persists analysis reports into **Supabase PostgreSQL**.

### Key Capabilities
- **Multi-Format Log Parser**: Parses log files line-by-line, tracking total log lines, severity errors, and failed password entries.
- **Dynamic Threat Risk Engine**: Categorizes suspicious IPs (exceeding 5 failed attempts) into **CRITICAL**, **HIGH**, **MEDIUM**, and **LOW** risk levels with mitigation recommendations.
- **Overall System Status**: Computes system health (**CRITICAL_ALERT**, **ELEVATED_RISK**, **NORMAL**).
- **Dual Database Architecture**: **Supabase PostgreSQL** persistent storage for production and isolated **H2 In-Memory DB** for test execution.
- **Modern Glassmorphic UI**: Single-page dashboard with drag-and-drop file upload, real-time KPI metrics, Chart.js visualizations, searchable threat table, sample log launcher, and JSON report export.
- **Swagger / OpenAPI 3**: Embedded interactive API docs at `/swagger-ui.html`.

---

## 📡 REST API Reference Overview

All API responses follow the standard `ApiResponse<T>` envelope:

| Method | Endpoint | Description | Consumes / Produces |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/logs/analyze` | Upload log file (`.log`, `.txt`, `.out`) for threat analysis | `multipart/form-data` → `application/json` |
| `GET` | `/api/logs/sample` | Analyze built-in sample log file instantly | `application/json` |
| `GET` | `/api/logs/history` | Retrieve 10 most recent analysis reports summary | `application/json` |
| `GET` | `/api/logs/history/{id}`| Fetch full detailed report by ID | `application/json` |

---

## 🚀 Local Quick Start

### 1. Run Backend (Spring Boot)
```bash
cd backend
./mvnw clean test          # Run automated unit test suite (17 tests)
./mvnw spring-boot:run     # Start backend at http://localhost:8080
```

### 2. Run Frontend
Open `frontend/index.html` directly in your browser or serve via any static HTTP server.

---

## 🌐 Cloud Deployment (Vercel & Render)

For full deployment instructions, see [`docs/deployment.md`](file:///Users/shaiksohel/Downloads/loganalyzer/docs/deployment.md).

- **Render Backend Blueprint**: Use [`render.yaml`](file:///Users/shaiksohel/Downloads/loganalyzer/render.yaml) with `rootDir: backend`.
- **Vercel Frontend**: Connect `frontend/` directory with `VITE_API_BASE_URL` pointing to your Render backend domain.