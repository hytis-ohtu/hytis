# HYTiS

[![codecov](https://codecov.io/gh/hytis-ohtu/hytis/graph/badge.svg?token=WLP90N7ZRE)](https://codecov.io/gh/hytis-ohtu/hytis)

**[View the project wiki](https://github.com/hytis-ohtu/hytis/wiki)** for additional documentation.

## Requirements

- **Node.js** 18+ and **npm** 9+
- **Docker** and **Docker Compose** (for the development setup with PostgreSQL and Redis)

## Development

1. Clone the repository

   HTTPS:

   ```bash
   git clone https://github.com/hytis-ohtu/hytis.git
   ```

   SSH:

   ```bash
   git clone git@github.com:hytis-ohtu/hytis.git
   ```

2. Navigate to the project root directory

   ```bash
   cd HYTiS
   ```

3. Install all dependencies

   ```bash
   npm run install:all
   ```

4. Set up environment variables

   **Backend**

   Create a `.env` file in the `backend` directory with the following contents for development:

   ```bash
   DATABASE_URL=YOUR_DATABASE_URL_HERE
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=change-this-to-a-long-random-string-in-production
   SESSION_MAX_AGE=86400000
   FRONTEND_URL=http://localhost:5173
   USE_HY_LOGIN=false
   ```

   For production environment and OIDC authentication setup to log into the University of Helsinki system, see `backend/.env.example` for additional required environment variables.

   **Option A: Using Docker PostgreSQL and Redis**

   If using the provided Docker containers (configured in `backend/database.yaml`), use the following URLs:

   ```bash
   DATABASE_URL=postgres://postgres:example@localhost:5432/postgres
   REDIS_URL=redis://localhost:6379
   ```

   Start the PostgreSQL and Redis containers in a new terminal (keep it running):

   ```bash
   npm run start:db
   ```

   **Option B: Using your own PostgreSQL and Redis**

   Configure `DATABASE_URL` and `REDIS_URL` to point to your existing PostgreSQL database and Redis instance.

   **Frontend**

   Create a `.env.development` file in the `frontend` directory with the following content:

   ```bash
   VITE_API_URL=http://localhost:3000
   ```

5. Add seed data to the database

   ```bash
   npm run seed:db
   ```

6. Start the backend development server (in a new terminal)

   ```bash
   npm run dev:backend
   ```

7. Start the frontend development server (in a new terminal)

   ```bash
   npm run dev:frontend
   ```

## npm commands

### General

- `npm run install:all` - Install dependencies for both backend and frontend

### Database

- `npm run start:db` - Start PostgreSQL database and Redis in Docker containers
- `npm run seed:db` - Add seed data to the database

### Backend

- `npm run dev:backend` - Start backend in development mode
- `npm run start:backend` - Start backend in production mode
- `npm run lint:backend` - Run linter for backend code

### Frontend

- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run preview:frontend` - Preview production build locally
- `npm run lint:frontend` - Run linter for frontend code

### Testing

- `npm run test:all` - Run all tests and linting

#### End-to-end

- `npm run test:e2e` - Run all end-to-end tests
- `npm run test:e2e-report` - Get report of all end-to-end tests

#### Backend

- `npm run test:backend` - Run all backend tests
- `npm run coverage:backend` - Get backend coverage

#### Frontend

- `npm run test:frontend` - Run all frontend tests
- `npm run coverage:frontend` - Get frontend coverage
