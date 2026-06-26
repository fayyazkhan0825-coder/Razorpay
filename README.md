# Rezorpay Backend Service

Rezorpay is a backend service for managing employee reimbursements with hierarchical role-based authorization (EMP, RM, APE, CFO).

## Setup & Running Guide

### 1. Environment Variables
Create a `.env` file in the root directory. You can copy the template from `.env.example`:

```bash
cp .env.example .env
```

The file should contain the following configurations:
- `PORT`: Port on which the express application runs (defaults to `7002` in development).
- `NODE_ENV`: Application environment (`development` or `production`).
- `JWT_SECRET`: The secret key used for signing and verifying JWT authentication cookies.
- `DB_HOST`: Hostname of the PostgreSQL database instance.
- `DB_PORT`: Port of the PostgreSQL database instance (default: `5432`).
- `DB_USER`: Username for database authentication.
- `DB_PASSWORD`: Password for database authentication.
- `DB_NAME`: Database name.

### 2. Database Migrations
Run the Knex migration command to set up the necessary tables (`users`, `employee_rm`, `reimbursements`):

```bash
npm run db:migrate
```

### 3. Database Seeding
Seed the database to create the default root CFO account (`cfo@org.com` / password: `CFO#ORG@April2026`):

```bash
npm run db:seed-data
```

### 4. Running the Development Server
Start the Express server in development mode using Nodemon:

```bash
npm run dev
```
The server will start listening on port `7002`.

---

## Schema Design Decisions

### Independent Approval Column Architecture
In the `reimbursements` table, rather than storing a single string/integer representing the overall reimbursement state (e.g. `'PENDING_RM'`, `'PENDING_APE'`, `'APPROVED'`), we store two independent columns:
1. `rm_approval_status` (Defaults to `'PENDING'`)
2. `ape_approval_status` (Defaults to `'PENDING'`)

#### Tradeoffs & Benefits:
* **Preserves State History:** Keeping these columns separate allows us to instantly query who approved, who rejected, and the exact state of approvals without maintaining a complex state-machine table, version history log, or event logs.
* **Asynchronous Transitions:** In the real world, approvals might happen asynchronously. Since RM approval is a hard prerequisite for APE approval, we can represent the business pipeline state by reading both columns independently.
* **Derived Overall Status:** The overall reimbursement status shown to the employee (EMP) is a computed/derived value derived programmatically:
  * If either `rm_approval_status` or `ape_approval_status` is `'REJECTED'`, the overall status is `'REJECTED'`.
  * If both `rm_approval_status` and `ape_approval_status` are `'APPROVED'`, the overall status is `'APPROVED'`.
  * Otherwise, the overall status is `'PENDING'`.

---

## Frontend Setup & Running Guide

The frontend application is built using React 19, Vite, and Tailwind CSS v4.

### 1. Environment Configuration
Create a `.env` file in the `frontend/` folder containing the backend URL (an example is provided in `frontend/.env.example`):
```bash
VITE_API_URL=https://razorpay-2fdh.onrender.com
# For local backend debugging, change to: http://localhost:7002
```

### 2. Monorepo Scripts
For ease of management, you can run these command scripts directly from the **root workspace directory**:
- **Run Frontend Dev Server (port 5173):** `npm run dev:frontend`
- **Build Frontend Assets (production):** `npm run build:frontend`
- **Run Backend Dev Server (port 7002):** `npm run dev`

Alternatively, navigate inside the `frontend/` directory and run standard Vite scripts:
- **Start Dev Server:** `npm run dev`
- **Build Production Bundle:** `npm run build`
- **Preview Build locally:** `npm run preview`
