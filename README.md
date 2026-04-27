# HYTiS

[![codecov](https://codecov.io/gh/hytis-ohtu/hytis/graph/badge.svg?token=WLP90N7ZRE)](https://codecov.io/gh/hytis-ohtu/hytis)

**[Projektin wikistä](https://github.com/hytis-ohtu/hytis/wiki)** löytyy lisää tietoa sovelluksesta.

## Vaatimukset

- **Node.js** 18+ ja **npm** 9+
- **Docker** ja **Docker Compose** (paikallista kehitysympäristöä varten, jos käytät PostgreSQL- ja Redis-kontteja)

## Kehitys

1. Kloonaa repositorio

   HTTPS:

   ```bash
   git clone https://github.com/hytis-ohtu/hytis.git
   ```

   SSH:

   ```bash
   git clone git@github.com:hytis-ohtu/hytis.git
   ```

2. Siirry projektin juurihakemistoon

   ```bash
   cd HYTiS
   ```

3. Asenna riippuvuudet

   ```bash
   npm run install:all
   ```

4. Määritä ympäristömuuttujat

   **Backend**

   Luo `backend`-hakemistoon `.env`-tiedosto seuraavilla muuttujilla:

   ```bash
   DATABASE_URL=YOUR_DATABASE_URL_HERE
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=change-this-to-a-long-random-string-in-production
   SESSION_MAX_AGE=86400000
   FRONTEND_URL=http://localhost:5173
   USE_HY_LOGIN=false
   ```

   Tuotantoympäristön ja Helsingin yliopiston OIDC-kirjautumiseen tarvittavat ympäristömuuttujat löydät tiedostosta `backend/.env.example`.

   **Vaihtoehto A: PostgreSQL ja Redis Dockerilla**

   Jos käytät valmiita Docker-kontteja, jotka on määritelty tiedostossa `backend/database.yaml`, käytä alla olevia arvoja:

   ```bash
   DATABASE_URL=postgres://postgres:example@localhost:5432/postgres
   REDIS_URL=redis://localhost:6379
   ```

   Käynnistä PostgreSQL- ja Redis-kontit uudessa komentorivi-ikkunassa ja pidä ne käynnissä:

   ```bash
   npm run start:db
   ```

   **Vaihtoehto B: Oma PostgreSQL ja Redis**

   Aseta `DATABASE_URL` ja `REDIS_URL` osoittamaan omaan PostgreSQL-tietokantaasi ja Redis-instanssiisi.

   **Frontend**

   Luo `frontend`-hakemistoon `.env.development`-tiedosto, seuraavilla muuttujilla:

   ```bash
   VITE_API_URL=http://localhost:3000
   ```

5. Lisää alkudata tietokantaan

   ```bash
   npm run seed:db
   ```

6. Käynnistä backend uudessa komentorivi-ikkunassa

   ```bash
   npm run dev:backend
   ```

7. Käynnistä frontend uudessa komentorivi-ikkunassa

   ```bash
   npm run dev:frontend
   ```

## npm-komennot

### Yleistä

- `npm run install:all` - Asenna kaikki sovelluksen tarvitsemat riippuvuudet

### Tietokanta

- `npm run start:db` - Käynnistä PostgreSQL ja Redis tietokantojen Docker-kontit
- `npm run seed:db` - Lisää alkudata tietokantaan

### Backend

- `npm run dev:backend` - Käynnistä backend kehitystilassa
- `npm run start:backend` - Käynnistä backend tuotannossa
- `npm run lint:backend` - Suorita backend-koodin linttaus

### Frontend

- `npm run dev:frontend` - Käynnistä frontend kehitystilassa
- `npm run build:frontend` - Rakenna frontend tuotantoa varten
- `npm run preview:frontend` - Käynnistä frontend tuotannossa
- `npm run lint:frontend` - Suorita frontend-koodin linttaus

### Testaus

- `npm run test:all` - Suorita kaikki testit ja linttaus

#### E2E

- `npm run test:e2e` - Suorita e2e-testit
- `npm run test:e2e-report` - Avaa raportti e2e-testeistä

#### Backend

- `npm run test:backend` - Suorita kaikki backend-testit
- `npm run coverage:backend` - Näytä backendin testikattavuus

#### Frontend

- `npm run test:frontend` - Suorita kaikki frontend-testit
- `npm run coverage:frontend` - Näytä frontendin testikattavuus
