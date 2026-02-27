# Schema database — Ecommerce vetrina

Schema pensato per un sito vetrina gestito dal backoffice: prodotti, immagini, testi, pagine personalizzate. Predisposto per collegare in seguito i pagamenti (Stripe, ecc.) senza stravolgere il DB.

---

## Panoramica tabelle

| Tabella        | Scopo |
|----------------|--------|
| `users`        | Utenti backoffice (già esistente + is_active, last_login_at) |
| `system_modules` | Moduli attivabili (ecommerce, stripe, blog, portfolio) |
| `categories`   | Categorie prodotti (albero, slug, SEO) |
| `products`     | Prodotti (nome, slug, descrizione, prezzo, in evidenza, ordinamento) |
| `media`        | File caricati (immagini/testi) — polimorfico su prodotti e pagine |
| `pages`        | Pagine CMS (Chi siamo, Contatti, pagine dedicate) |
| `settings`     | Configurazione sito (nome, logo, testi globali, chiave/valore) |
| *(futuro)* `orders` | Ordini (da aggiungere quando attivi i pagamenti) |
| *(futuro)* `order_items` | Righe ordine |
| *(futuro)* `payments` | Pagamenti (Stripe, ecc.) |

---

## Dettaglio tabelle

### `users` (esistente + esteso)
- `id`, `name`, `email`, `password`, `email_verified_at`, `remember_token`
- `is_active` (boolean), `last_login_at` (timestamp)
- **`role`** — string, default `user`: `admin` | `editor` | `user` (solo admin/editor accedono al backoffice)
- `created_at`, `updated_at`

### `system_modules` (esistente)
- `id`, `name` (unique), `is_active`, `description`, `timestamps`

### `categories`
- `id` — PK
- `parent_id` — FK nullable → categories.id (per albero)
- `name` — Nome categoria
- `slug` — URL univoco (es. `elettronica`, `smartphone`)
- `description` — Testo opzionale
- `meta_title`, `meta_description` — SEO
- `sort_order` — int, ordinamento
- `is_active` — boolean
- `created_at`, `updated_at`

### `products`
- `id` — PK
- `category_id` — FK nullable → categories.id
- `name` — Nome prodotto
- `slug` — URL univoco (es. `iphone-15-pro`)
- `short_description` — Testo breve (card, listing)
- `description` — HTML/testo lungo (pagina prodotto)
- `price` — decimal 10,2
- `compare_at_price` — decimal nullable (prezzo barrato)
- `is_active` — boolean (visibile in vetrina)
- `is_featured` — boolean (in evidenza in homepage)
- `sort_order` — int
- `meta_title`, `meta_description` — SEO
- **`video_url`** — string nullable (URL YouTube/Vimeo per embed)
- **`label`** — string nullable (etichetta singola in evidenza, es. "Nuovo")
- `created_at`, `updated_at`

### `media` (polimorfico)
Usato per immagini (e in futuro file) collegati a prodotti o pagine.

- `id` — PK
- `mediaable_type` — string (es. `App\Models\Product`, `App\Models\Page`)
- `mediaable_id` — bigint
- `disk` — string (es. `public`)
- `path` — path relativo sul disk
- `filename` — nome file salvato
- `original_name` — nome file originale
- `mime_type` — es. `image/jpeg`
- `size` — int (bytes)
- `alt` — testo alternativo (accessibilità/SEO)
- `caption` — didascalia opzionale
- `sort_order` — int
- `created_at`, `updated_at`

Indice: `(mediaable_type, mediaable_id)`.

### `pages`
Pagine CMS (Chi siamo, Contatti, landing, ecc.).

- `id` — PK
- `title` — Titolo pagina
- `slug` — URL univoco (es. `chi-siamo`, `contatti`)
- `body` — HTML/testo lungo (contenuto)
- `meta_title`, `meta_description` — SEO
- `is_active` — boolean
- `sort_order` — int
- `created_at`, `updated_at`

### `settings`
Configurazione globale chiave/valore (nome sito, logo, footer, social, ecc.).

- `id` — PK
- `key` — string unique (es. `site_name`, `logo_url`, `footer_text`)
- `value` — text (valore; per JSON usare stringa serializzata)
- `type` — enum o string: `string`, `text`, `boolean`, `json`, `image`
- `created_at`, `updated_at`

### `product_attributes`
Caratteristiche prodotto (elenco puntato in dettaglio).

- `id` — PK
- `product_id` — FK → products.id (CASCADE)
- `sort_order` — int
- `label` — es. "Colore", "Materiale"
- `value` — es. "Rosso", "Cotone"
- `created_at`, `updated_at`

### `product_tags`
Tag riutilizzabili (Nuovo, Ultimi arrivi, In offerta).

- `id` — PK
- `name` — Nome visualizzato
- `slug` — unique (es. `nuovo`, `ultimi-arrivi`)
- `sort_order` — int
- `created_at`, `updated_at`

### `product_product_tag` (pivot)
Many-to-many prodotti ↔ tag.

- `id` — PK
- `product_id` — FK → products.id
- `product_tag_id` — FK → product_tags.id
- Unique (`product_id`, `product_tag_id`)

### `product_inquiries`
Richieste informazioni dal form contatto prodotto.

- `id` — PK
- `product_id` — FK nullable → products.id
- `name`, `email`, `message`
- `status` — es. `new`, `read`, `closed`
- `notes` — text nullable (note interne admin)
- `created_at`, `updated_at`

### `product_views`
Tracciamento viste per statistiche.

- `id` — PK
- `product_id` — FK → products.id
- `viewed_at` — timestamp
- `session_id` — string nullable (per deduplicazione)
- `ip_address` — string nullable

---

## Futuro: pagamenti

Quando attiverai i pagamenti potrai aggiungere (es. in nuove migrazioni):

- **orders**: id, user_id (nullable per guest), status, total, email, shipping_address (JSON o colonne), notes, timestamps
- **order_items**: id, order_id, product_id, quantity, unit_price, timestamps
- **payments**: id, order_id, provider (stripe, …), external_id, amount, status, metadata (JSON), timestamps

Il modulo `system_modules` (es. `stripe`) può abilitare le route e la logica collegata.

---

## Convenzioni

- **Slug**: univoci per categoria, prodotto, pagina. Generati da nome/titolo (lowercase, trattini).
- **Prezzi**: decidere se in centesimi (integer) o in unità (decimal). Lo schema usa `decimal(10,2)` per flessibilità; in Laravel puoi castare a `float` o lavorare in centesimi con un mutator.
- **Media**: storage su `storage/app/public` (link pubblico con `php artisan storage:link`). Il campo `path` è relativo al disk.

---

## File migrazioni (Laravel)

Le migrazioni corrispondenti sono in:

- `database/migrations/..._create_categories_table.php`
- `database/migrations/..._create_products_table.php`
- `database/migrations/..._create_media_table.php`
- `database/migrations/..._create_pages_table.php`
- `database/migrations/..._create_settings_table.php`

Dopo aver creato il DB e configurato `.env`, eseguire:

```bash
cd backend
php artisan migrate
php artisan db:seed  # se necessario
```

---

## Variabili ambiente backend (`.env`)

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nome_database
DB_USERNAME=root
DB_PASSWORD=

# Per SPA / frontend Node che chiama l'API
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000

# Storage (per upload immagini)
FILESYSTEM_DISK=public
```

Crea il database (MySQL/MariaDB) con nome uguale a `DB_DATABASE` prima di lanciare `migrate`.
