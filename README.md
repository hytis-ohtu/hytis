# Sijoittaja

## Instructions

1. Clone the repository

```bash
HTTPS - git clone https://github.com/aarnif/Sijoittaja.git

SSH - git clone git@github.com:aarnif/Sijoittaja.git
```

2. Navigate to the project root directory

```bash
cd Sijoittaja
```

3. Install all dependencies

```bash
npm run install:all
```

4. Set up environment variables

Create a `.env` file in the `backend` directory with the following contents:

```bash
DATABASE_URL=YOUR_DATABASE_URL_HERE
```

**Option A: Using Docker PostgreSQL (recommended for development)**

If using the provided Docker PostgreSQL container, your `DATABASE_URL` should be:

```bash
DATABASE_URL=postgres://postgres:example@localhost:5432/postgres
```

Start the database container in a new terminal (leave it running):

```bash
npm run start:db
```

**Option B: Using your own PostgreSQL instance**

Configure `DATABASE_URL` to point to your existing PostgreSQL database.

5. Seed the database with initial seed data

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

### Available Commands

#### General

- `npm run install:all` - Install dependencies for both backend and frontend

#### Database

- `npm run start:db` - Start PostgreSQL database in Docker container
- `npm run seed:db` - Seed database with initial seed data

#### Backend

- `npm run dev:backend` - Start backend in development mode
- `npm run start:backend` - Start backend in production mode
- `npm run lint:backend` - Run linter for backend code

#### Frontend

- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run preview:frontend` - Preview production build locally
- `npm run lint:frontend` - Run linter for frontend code
