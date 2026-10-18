# Job Application Tracker Portal — Java Full Stack

A beginner-friendly Java full-stack version of the Job Application Tracker Portal.

## Stack
- Java 17
- Spring Boot 3
- Spring Web, Spring Data JPA, Bean Validation
- Spring Security + JWT
- H2 database by default (no database installation required)
- React + Vite frontend
- Maven

## Features
- Register and login with JWT
- Add, view, update, and delete job applications
- Filter by status and search company/role
- Dashboard summary
- User-owned records (a user can only access their own applications)
- H2 persistent file database for local development

## Requirements
- JDK 17+
- Node.js 18+
- Maven 3.9+ (or use an IDE with Maven support)

## Run the backend
Open a terminal in `server`:

```bash
mvn spring-boot:run
```

Backend: http://localhost:8080  
H2 console: http://localhost:8080/h2-console

H2 console JDBC URL: `jdbc:h2:file:./data/jobtracker`  
Username: `sa`  
Password: (leave blank)

## Run the frontend
Open another terminal in `client`:

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173

## First use
1. Open the frontend.
2. Register a new account.
3. Sign in and add applications.
4. Use the status dropdown and search box to filter.
5. Edit or delete your own applications.

## API
Base URL: `http://localhost:8080/api`

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/auth/register` | No | Register |
| POST | `/auth/login` | No | Login |
| GET | `/jobs` | Yes | List own jobs; optional `status` and `search` query params |
| GET | `/jobs/{id}` | Yes | Get own job |
| POST | `/jobs` | Yes | Create job |
| PUT | `/jobs/{id}` | Yes | Update job |
| DELETE | `/jobs/{id}` | Yes | Delete job |
| GET | `/jobs/summary` | Yes | Dashboard counts |

## Security notes
- Passwords are BCrypt-hashed.
- JWT secret is configured in `server/src/main/resources/application.properties` for local demo only. Replace it with an environment variable and a long random secret before deployment.
- H2 is intended for local development. For production, use PostgreSQL or MySQL, HTTPS, secure token storage, rate limiting, and proper CORS restrictions.
- Do not upload credentials or real user data.

## Project structure
```text
Job-Application-Tracker-Java-Full-Stack/
├── server/   Spring Boot REST API
├── client/   React UI
└── README.md
```
