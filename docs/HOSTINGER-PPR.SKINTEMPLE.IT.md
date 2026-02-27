# Deploy su Hostinger — ppr.skintemple.it

Guida per far girare il progetto su Hostinger con dominio **ppr.skintemple.it**.

## Architettura consigliata

Tutto gira su **un solo dominio**: `https://ppr.skintemple.it`.

Struttura nella root dell’hosting (tipicamente `public_html`):

- `index.php` → reindirizza a `/frontend/` (vetrina).
- `.htaccess` → instrada tutte le richieste `/api/*` verso `backend/public/index.php` (Laravel).
- `backend/` → progetto Laravel (API).
- `frontend/` → file statici generati dal build Vite (`frontend/dist/`).

---

## 1. Backend Laravel (`backend/`)

### 1.1 Crea il database su Hostinger

- Pannello Hostinger → **Database** → MySQL → Crea database.
- Annota: nome DB, utente, password, host (solitamente `localhost`).

### 1.2 Carica il backend

- Carica la cartella **backend/** (tutto il progetto Laravel) sul server, ad es. in `public_html/backend/`.

### 1.3 File `.env` in produzione (backend)

Crea/modifica `.env` nella root del progetto Laravel (`public_html/backend/.env`, non in `public/`):

```env
APP_NAME="PPR Skintemple"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ppr.skintemple.it

# Genera una chiave sicura: php artisan key:generate
APP_KEY=base64:...

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u123456789_ppr
DB_USERNAME=u123456789_ppr
DB_PASSWORD=la_tua_password_db

# Frontend: dominio (uguale, stessa origine)
FRONTEND_URL=https://ppr.skintemple.it
SESSION_DOMAIN=ppr.skintemple.it
SANCTUM_STATEFUL_DOMAINS=ppr.skintemple.it

FILESYSTEM_DISK=public
```

- Sostituisci `DB_*` con i dati del database creato su Hostinger.
- Esegui **una sola volta** sul server (SSH o terminale Hostinger):

```bash
cd /path/to/public_html/backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

### 1.4 HTTPS

Su Hostinger di solito SSL è attivo per il dominio. Verifica che **https://ppr.skintemple.it/api/public/settings** risponda correttamente una volta configurato il rewrite (`.htaccess`) e il backend.

---

## 2. Frontend Vite (`frontend/`)

### 2.1 Build locale

In locale:

```bash
cd frontend
npm install
npm run build
```

Questo genera la cartella `frontend/dist/` con tutti i file statici.

### 2.2 Carica il frontend su Hostinger

- Carica **il contenuto** di `frontend/dist/` dentro `public_html/frontend/` (non la cartella `dist`, ma i file al suo interno).
- Assicurati che i file principali siano, ad esempio:
  - `public_html/frontend/index.html`
  - `public_html/frontend/prodotti.html`
  - `public_html/frontend/prodotto.html`
  - `public_html/frontend/pagina.html`
  - `public_html/frontend/admin.html`
  - `public_html/frontend/assets/*`

### 2.3 Redirect root e rewrite API

Nella root `public_html`:

- `index.php`:

```php
<?php
header('Location: /frontend/');
exit;
```

- `.htaccess` (esempio minimo):

```apacheconf
RewriteEngine On

# Instrada le API a Laravel (backend/public/index.php)
RewriteRule ^api(/.*)?$ backend/public/index.php [L,QSA]
```

### 2.4 Verifica

- **https://ppr.skintemple.it** → vetrina (home, prodotti, ecc.)
- **https://ppr.skintemple.it/admin** → backoffice
- Il frontend deve chiamare l’API su **https://api.ppr.skintemple.it** (nessun errore CORS se `FRONTEND_URL` e CORS sono impostati come sopra).

---

## 3. Riepilogo variabili per ppr.skintemple.it

| Dove | Variabile | Valore produzione |
|------|-----------|--------------------|
| Backend | `APP_URL` | `https://ppr.skintemple.it` |
| Backend | `FRONTEND_URL` | `https://ppr.skintemple.it` |
| Backend | `SESSION_DOMAIN` | `ppr.skintemple.it` |
| Backend | `SANCTUM_STATEFUL_DOMAINS` | `ppr.skintemple.it` |
| Backend | `DB_*` | Dati database Hostinger |
| Frontend (Vite) | `VITE_API_URL` | `https://ppr.skintemple.it/api` |

---

## 4. Checklist pre-deploy

- [ ] Database MySQL creato su Hostinger
- [ ] Backend Laravel caricato in `public_html/backend`
- [ ] `.env` backend compilato con `APP_URL`, `FRONTEND_URL`, `DB_*`, `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS`
- [ ] Eseguiti: `migrate --force`, `db:seed --force`, `storage:link`, `config:cache`
- [ ] Build Vite eseguito in locale (`npm run build` in `frontend/`)
- [ ] Contenuto di `frontend/dist/` caricato in `public_html/frontend/`
- [ ] File `index.php` e `.htaccess` creati in `public_html` come indicato sopra
- [ ] SSL attivo su `ppr.skintemple.it`

---

## 6. Nome sito e testi

Dopo il primo `db:seed`, le impostazioni predefinite (tabella `settings`) hanno valori generici. Puoi aggiornarli dal backoffice (quando avrai collegato le API admin) oppure direttamente in DB. La chiave `site_name` è usata in header e titoli: impostala a "PPR Skintemple" (o il nome che preferisci) quando sei in produzione.

---

Dopo questi passi il link **ppr.skintemple.it** sarà configurato per girare su Hostinger.
