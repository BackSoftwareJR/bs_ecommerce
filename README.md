# Ecommerce Template — Vetrina

Piattaforma **vetrina** headless: backend Laravel (API) + frontend **Vite** (HTML/JS/CSS statici) in stile **Apple**, con storefront pubblico e backoffice leggero. Predisposta per aggiungere in seguito i pagamenti (Stripe, ecc.).

## Struttura

- `backend/` — Laravel 12 API (prodotti, categorie, pagine, media, settings). Espone le API pubbliche per il frontend sotto `/api/public/*`.
- `frontend/` — Frontend Vite (multi‑pagina: home, prodotti, dettaglio prodotto, pagine CMS, dashboard admin). Builda in `frontend/dist/`.
- `docs/` — Schema DB, setup e deploy (inclusa la guida per Hostinger).

## Documentazione

- **[docs/SCHEMA-DATABASE.md](docs/SCHEMA-DATABASE.md)** — Schema database completo (tabelle, campi, convenzioni). Da usare per creare il DB e le variabili d’ambiente.
- **[docs/SETUP-E-DEPLOY.md](docs/SETUP-E-DEPLOY.md)** — Setup locale (backend + frontend Vite) e deploy generico.
- **[docs/HOSTINGER-PPR.SKINTEMPLE.IT.md](docs/HOSTINGER-PPR.SKINTEMPLE.IT.md)** — Deploy su Hostinger per **ppr.skintemple.it** con `backend/` + `frontend/`.

## Setup rapido (sviluppo locale)

1. **Database**: crea un database MySQL (es. `ecommerce_vetrina`).
2. **Backend**:  
   `cd backend` → `cp .env.example .env` → configura `DB_*` e `APP_URL` → `composer install` → `php artisan key:generate` → `php artisan migrate` → `php artisan db:seed` → `php artisan storage:link` → `php artisan serve`.
3. **Frontend (Vite)**:  
   `cd frontend` → crea `.env.development` con `VITE_API_URL=http://localhost:8000/api` → `npm install` → `npm run dev`.

- **Vetrina**: http://localhost:5173 (porta predefinita Vite)  
- **API**: http://localhost:8000/api (pubbliche sotto `/api/public/*`)

## Variabili d’ambiente

- **Backend** (`.env` in `backend/`): `DB_*`, `APP_URL`, `FRONTEND_URL`, `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS`, `FILESYSTEM_DISK`.
- **Frontend** (`.env.development` / `.env.production` in `frontend/`): `VITE_API_URL` (es. `http://localhost:8000/api` in dev, `https://ppr.skintemple.it/api` in produzione).

Dettagli in [docs/SETUP-E-DEPLOY.md](docs/SETUP-E-DEPLOY.md).
