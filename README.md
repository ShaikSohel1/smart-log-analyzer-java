 Smart Log Analyzer

A simple log analysis tool built using Java and Spring Boot to analyze server logs and detect issues like errors, failed login attempts, and suspicious IP activity.

The project also includes a lightweight dashboard built using HTML, CSS, and JavaScript to visualize the analysis results.

⸻

Features

* Upload .log files for analysis
* Detect application errors
* Track failed login attempts
* Identify suspicious IP addresses
* View results in a simple dashboard
* Export results as JSON
* Test APIs using Swagger UI

⸻

Tech Stack

Backend

* Java 17
* Spring Boot
* Maven
* REST APIs

Frontend

* HTML
* CSS
* JavaScript
* Chart.js

Tools

* Git
* GitHub
* Postman
* VS Code

⸻

Project Structure

src
├── main
│   ├── java
│   │   └── com/sohel/loganalyzer
│   │       ├── controller
│   │       ├── service
│   │       └── model
│   │
│   └── resources
│       └── static
│           ├── index.html
│           ├── style.css
│           └── script.js
│
└── test

⸻

API Endpoint

Analyze Logs

POST /api/logs/analyze

Request type:

multipart/form-data

Parameter:

Name	Type
file	.log file

Example response:

{
  "totalLogs": 12,
  "errors": 2,
  "failedLogins": 7,
  "suspiciousIPs": {
    "192.168.1.10": 6
  }
}

⸻

Running the Project

Clone the repository:

git clone https://github.com/ShaikSohel1/smart-log-analyzer-java.git

Move into the project folder:

cd smart-log-analyzer-java

Start the application:

mvn spring-boot:run

Open in browser:

http://localhost:8080

Swagger documentation:

http://localhost:8080/swagger-ui/index.html

⸻

Future Improvements

* Real-time log monitoring
* Cloud deployment using Azure
* Email alerts for suspicious activity
* Database support for storing previous analysis reports
* Support for larger log files

⸻

Author

Sohel Shaik

Integrated M.Tech in Software Engineering
VIT-AP University