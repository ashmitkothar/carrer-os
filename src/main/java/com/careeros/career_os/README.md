# Career OS 🚀
### AI-Powered Career Management Platform

Career OS is a web-based career management platform designed to help students and job seekers manage their career journey in one place.

It combines job recommendations, application tracking, resume management, career analytics, and an AI-powered career assistant.

## ✨ Features

- **User Authentication** – User registration and login.
- **Personal Profile** – Manage education, skills, experience, and career interests.
- **Job Recommendations** – Explore relevant job opportunities.
- **Application Tracker** – Track job applications and their statuses.
- **Career Analytics** – Monitor application progress and profile completion.
- **Resume Builder** – Create and manage professional resumes.
- **Resume Analyzer** – Analyze resumes and get improvement suggestions.
- **AI Career Assistant** – Get AI-powered career guidance.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Java | Backend programming |
| Spring Boot | Backend framework |
| Spring Data JPA | Database operations |
| MySQL | Database |
| React.js | Frontend |
| JavaScript | Frontend functionality |
| CSS | UI styling |
| Maven | Backend build management |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
career-os/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── App.jsx
│       ├── Dashboard.jsx
│       ├── Profile.jsx
│       ├── Jobs.jsx
│       ├── Tracker.jsx
│       ├── Resume.jsx
│       └── Assistant.jsx
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/careeros/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       └── career_os/
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/ashmitkothar/carrer-os.git
cd carrer-os
```

### 2. Configure MySQL

Create a database:

```sql
CREATE DATABASE career_os;
```

Configure your database credentials using environment variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

### 3. Run the Spring Boot Backend

Open the project root in IntelliJ IDEA and run:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

### 4. Run the React Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL shown by Vite in your terminal.

## 🔐 Security

- Keep database credentials and API keys outside source code.
- Use environment variables for sensitive configuration.
- Do not commit `.env` files or private credentials.

## 📸 Screenshots

Screenshots of the application will be added here.

## 🎯 Project Goal

The goal of Career OS is to provide a centralized platform that simplifies career planning, job searching, resume building, and application management.

## 👨‍💻 Author

**Ashmit Kothar**

GitHub: [@ashmitkothar](https://github.com/ashmitkothar)

---

*Career OS – Your Career, Organized.*
