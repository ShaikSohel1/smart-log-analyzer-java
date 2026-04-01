🚀 Smart Log Analyzer (Spring Boot)

📌 Overview

A production-ready log analysis backend built using Spring Boot.
This tool processes server log files and detects errors, failed login attempts, and suspicious IP activity.

⸻

⚙️ Features
	•	📂 Upload .log files via REST API
	•	🔍 Detect errors and failed logins
	•	🌐 Identify suspicious IPs
	•	📊 JSON-based report generation
	•	📘 Swagger UI for API testing

⸻

🛠️ Tech Stack
	•	Java 17
	•	Spring Boot
	•	Maven
	•	REST API
	•	Swagger (OpenAPI)

⸻

🚀 API Endpoint

Analyze Logs

POST /api/logs/analyze

Request
	•	Type: multipart/form-data
	•	Key: file
	•	Value: .log file

   {
  "totalLogs": 12,
  "errors": 2,
  "failedLogins": 7,
  "suspiciousIPs": {
    "192.168.1.10": 6
  }
}

🧪 Run Locally
mvn spring-boot:run

📘 Swagger UI

http://localhost:8080/swagger-ui/index.html

🌟 Future Improvements
	•	Real-time log monitoring
	•	Cloud deployment (Azure)
	•	Dashboard UI (React)
	•	Alert system (Email/Slack)

⸻

👨‍💻 Author

Sohel Shaik
:::

