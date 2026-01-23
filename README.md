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

4. Start the backend development server (in a new terminal)

```bash
npm run dev:backend
```

5. Start the frontend development server (in a new terminal)

```bash
npm run dev:frontend
```

### Available Commands

#### General

- `npm run install:all` - Install dependencies for both backend and frontend

#### Backend

- `npm run dev:backend` - Start backend in development mode
- `npm run start:backend` - Start backend in production mode
- `npm run lint:backend` - Run linter for backend code
- `npm run prettier:backend` - Format backend code with Prettier

#### Frontend

- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run preview:frontend` - Preview production build locally
- `npm run lint:frontend` - Run linter for frontend code
