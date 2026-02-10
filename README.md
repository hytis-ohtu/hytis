# HYTiS

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

    **Option B: Using your own PostgreSQL database**

    Configure `DATABASE_URL` to point to your existing PostgreSQL database.

    **Frontend**

    Create `.env.development` and `.env.production` files in the `frontend` directory with the following contents:

    `.env.development`:

    ```bash
    VITE_API_URL=http://localhost:3000
    ```

    `.env.production`:

    ```bash
    VITE_API_URL=YOUR_PRODUCTION_API_URL_HERE
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

- `npm run start:db` - Start PostgreSQL database in Docker container
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
