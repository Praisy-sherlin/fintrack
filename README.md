# FinTrack — Enterprise Finance & Banking Portal

A full-stack **React + Spring Boot** web application for organizational finance management. Covers payroll, expenses, loans, compliance, and analytics with JWT-based authentication and role-based access control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Redux Toolkit, React Router v6 |
| Backend | Spring Boot 3.x, Spring Security 6, Spring Data JPA |
| Auth | JWT (access + refresh tokens), BCrypt, TOTP 2FA |
| Database | PostgreSQL (primary), Redis (cache/sessions) |
| Deployment | Vercel (frontend), Railway (backend), Supabase (PostgreSQL) |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
fintrack/
├── frontend/           # React + Vite SPA
│   ├── src/
│   │   ├── components/ # UI components by module
│   │   ├── pages/      # Route-level page components
│   │   ├── store/      # Redux store + slices
│   │   ├── services/   # Axios API service layer
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Helpers, formatters, constants
│   ├── package.json
│   └── vite.config.js
│
├── backend/            # Spring Boot REST API
│   └── src/main/java/com/fintrack/
│       ├── auth/       # JWT auth, login, register, refresh
│       ├── security/   # Spring Security config, filters
│       ├── config/     # CORS, Redis, app config
│       ├── employee/   # Employee CRUD + profiles
│       ├── payroll/    # Payroll processing + payslips
│       ├── expense/    # Expense claims + approvals
│       ├── loan/       # Loan applications + EMI
│       ├── analytics/  # Reports + dashboard data
│       ├── audit/      # Audit trail logging
│       └── notification/ # Email + in-app alerts
│
├── docker-compose.yml  # Local dev environment
├── .github/workflows/  # CI/CD pipelines
└── README.md
```

---

## Modules

1. **Auth & Identity** — Login, Register, JWT, 2FA, RBAC
2. **Employee Management** — Profiles, KYC, departments
3. **Payroll** — Salary structure, processing, payslips, TDS
4. **Expense & Reimbursement** — Claims, approvals, receipts
5. **Loan Management** — Applications, EMI calculator, repayment
6. **Financial Analytics** — Charts, P&L, budget vs actual
7. **Compliance & Audit** — Form 16, audit logs, TDS reports
8. **Notifications** — Email, in-app, compliance reminders

---

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/fintrack.git
cd fintrack
```

### 2. Backend

```bash
cd backend
# Edit src/main/resources/application.properties with your DB credentials
./mvnw spring-boot:run
# API runs at http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8080
npm run dev
# App runs at http://localhost:5173
```

### 4. Docker (Full Stack)

```bash
docker-compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:8080
# PgAdmin:  http://localhost:5050
```

---

## Default Users (Dev)

| Role | Email | Password |
|---|---|---|
| Admin | admin@fintrack.com | Admin@123 |
| Finance Manager | manager@fintrack.com | Manager@123 |
| Employee | employee@fintrack.com | Employee@123 |
| Auditor | auditor@fintrack.com | Auditor@123 |

---

## API Endpoints

### Auth
- `POST /api/auth/login` — Login, returns JWT
- `POST /api/auth/register` — Register new user
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Invalidate refresh token
- `POST /api/auth/2fa/enable` — Enable TOTP 2FA

### Employees
- `GET /api/employees` — List all employees
- `POST /api/employees` — Create employee
- `GET /api/employees/{id}` — Get by ID
- `PUT /api/employees/{id}` — Update
- `DELETE /api/employees/{id}` — Delete (Admin only)

### Payroll
- `GET /api/payroll` — List payroll records
- `POST /api/payroll/process` — Run monthly payroll
- `GET /api/payroll/{id}/payslip` — Download payslip PDF
- `GET /api/payroll/summary` — Monthly summary

### Expenses
- `GET /api/expenses` — List claims
- `POST /api/expenses` — Submit claim
- `PUT /api/expenses/{id}/approve` — Approve claim
- `PUT /api/expenses/{id}/reject` — Reject claim

### Loans
- `GET /api/loans` — List loans
- `POST /api/loans/apply` — Apply for loan
- `GET /api/loans/{id}/schedule` — Repayment schedule
- `PUT /api/loans/{id}/approve` — Approve (Manager)

### Analytics
- `GET /api/analytics/dashboard` — Dashboard KPIs
- `GET /api/analytics/payroll-trend` — Monthly trend
- `GET /api/analytics/expense-breakdown` — Category breakdown
- `GET /api/analytics/tax-summary` — TDS/Tax report

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Connect GitHub repo to Vercel, set VITE_API_URL env var
```

### Backend → Railway
```bash
# Push to GitHub, connect repo to Railway
# Set environment variables in Railway dashboard
```

### Environment Variables

**Frontend (.env)**
```
VITE_API_URL=https://your-backend.railway.app
VITE_APP_NAME=FinTrack
```

**Backend (application.properties)**
```properties
spring.datasource.url=jdbc:postgresql://host:5432/fintrack
spring.datasource.username=postgres
spring.datasource.password=yourpassword
jwt.secret=your-256-bit-secret-key
jwt.expiration=86400000
spring.redis.host=your-redis-host
spring.mail.host=smtp.gmail.com
spring.mail.username=your-email
spring.mail.password=your-app-password
```

---

## Security Features

- JWT access tokens (15 min) + refresh tokens (7 days)
- BCrypt password hashing (strength 12)
- TOTP-based 2FA (Google Authenticator compatible)
- RBAC: Admin, Finance Manager, Employee, Auditor
- AES-256 encryption on sensitive financial fields
- Full audit trail on every financial action
- Redis-backed token blacklisting on logout
- Rate limiting on auth endpoints
- CORS, CSRF protection
- Account lockout after 5 failed login attempts

---

## License
MIT — Free to use and modify.
