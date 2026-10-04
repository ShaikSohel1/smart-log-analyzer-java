# 📡 REST API Specification

The Smart Log Analyzer backend provides RESTful JSON endpoints wrapped in a standardized `ApiResponse<T>` envelope schema:

```json
{
  "success": true,
  "message": "Operation response description",
  "status": 200,
  "timestamp": "2026-10-04T18:03:46.153",
  "data": { ... }
}
```

---

## 🚀 Endpoints

### 1. Upload & Analyze Log File
- **Endpoint**: `POST /api/logs/analyze`
- **Consumes**: `multipart/form-data`
- **Produces**: `application/json`
- **Parameters**: `file` (Multipart file, required, max 10MB, allowed extensions: `.log`, `.txt`, `.out`)

#### Successful Response (200 OK):
```json
{
  "success": true,
  "message": "Log file analyzed successfully.",
  "status": 200,
  "timestamp": "2026-10-04T18:03:46.153",
  "data": {
    "id": 1,
    "fileName": "sample.log",
    "fileSize": 5469,
    "totalLogs": 57,
    "errors": 6,
    "errorCount": 6,
    "failedLogins": 43,
    "suspiciousIpCount": 4,
    "suspiciousIPs": {
      "198.51.100.45": 18,
      "203.0.113.195": 12,
      "45.33.32.156": 7,
      "192.168.1.100": 6
    },
    "ipActivities": [
      {
        "ipAddress": "198.51.100.45",
        "attemptCount": 18,
        "riskLevel": "CRITICAL",
        "recommendation": "Immediately block IP at firewall level and trigger incident response workflow."
      }
    ],
    "overallStatus": "CRITICAL_ALERT",
    "processedAt": "2026-10-04T18:03:44.138"
  }
}
```

#### Error Response (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid file extension. Allowed extensions are .log, .txt, .out",
  "status": 400,
  "timestamp": "2026-10-04T18:03:46.153",
  "data": null
}
```

---

### 2. Analyze Built-in Sample Log
- **Endpoint**: `GET /api/logs/sample`
- **Produces**: `application/json`
- **Description**: Analyzes built-in demonstration `sample.log` file.

---

### 3. Fetch Recent Analysis History
- **Endpoint**: `GET /api/logs/history`
- **Produces**: `application/json`
- **Description**: Returns top 10 most recent log reports stored in Supabase PostgreSQL ordered by creation date descending.

---

### 4. Fetch Report Details By ID
- **Endpoint**: `GET /api/logs/history/{id}`
- **Produces**: `application/json`
- **Path Parameter**: `id` (Long, required)

---

## 📖 Swagger / OpenAPI 3

Interactive Swagger UI documentation is accessible at:
- **Swagger UI**: `/swagger-ui.html`
- **OpenAPI JSON Spec**: `/v3/api-docs`
