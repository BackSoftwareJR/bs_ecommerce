# Setup e deploy — Ecommerce vetrina

## Schema DB e creazione database

1. **Crea il database** (MySQL/MariaDB) con il nome che userai (es. `ecommerce_vetrina`).

2. **Backend Laravel — `.env`** (in `backend/`):

```env
APP_NAME="Vetrina"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_vetrina
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1

FILESYSTEM_DISK=public
```

3. **Migrazioni e seed**:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

4. **Avvio backend**:

```bash
php artisan serve
```

API disponibile su `http://localhost:8000`. Route pubbliche:  
`/api/public/settings`, `/api/public/products`, `/api/public/products/{slug}`, `/api/public/categories`, `/api/public/pages`, `/api/public/pages/{slug}`.

---

## Frontend Vite (storefront + backoffice)

1. **Crea `.env.development`** in `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
```

2. **Installazione e avvio**:

```bash
cd frontend
npm install
npm run dev
```

- **Storefront**: http://localhost:5173  

---

## Deploy su Hostinger

**Per il dominio ppr.skintemple.it** usa la guida dedicata: **[HOSTINGER-PPR.SKINTEMPLE.IT.md](HOSTINGER-PPR.SKINTEMPLE.IT.md)**.

---

### Backend (Laravel) — riferimento generico

- Hostinger supporta **PHP** e **MySQL**. Carica il contenuto di `backend/` sul server (document root del dominio/sottodominio sulla cartella `public` del progetto Laravel).
- Crea un database MySQL dal pannello e aggiorna `DB_*` nel `.env` in produzione.
- Esegui `php artisan migrate --force` e `php artisan storage:link` sull’host (via SSH o script di deploy).

### Frontend Vite (dist / pubblicazione)

- Il frontend è buildato con **Vite** in `frontend/`.  
- In locale esegui:

```bash
cd frontend
npm install
npm run build
```

- La cartella `frontend/dist/` conterrà i file statici (HTML/CSS/JS) da caricare nella cartella pubblica del server (es. `public_html/frontend/`).

---

## Riepilogo variabili d’ambiente

| Dove        | Variabile        | Esempio                          |
|------------|------------------|----------------------------------|
| Backend    | `DB_DATABASE`    | `ecommerce_vetrina`              |
| Backend    | `DB_USERNAME`   | `root` / utente DB Hostinger    |
| Backend    | `DB_PASSWORD`   | password DB                     |
| Backend    | `APP_URL`       | `https://ppr.skintemple.it`     |
| Backend    | `FRONTEND_URL`  | `https://ppr.skintemple.it`     |
| Frontend   | `VITE_API_URL`  | `https://ppr.skintemple.it/api` |

Dopo aver creato il DB, configurato `.env` e lanciato migrazioni + seed, lo schema ecommerce vetrina è pronto; il backoffice e la vetrina sono predisposti per quando collegherai i pagamenti (Stripe, ecc.).
