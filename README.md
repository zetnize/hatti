# HATTI

Editorial storefront for HATTI — contemporary Circassian clothing and accessories.

## Run locally

```bash
pnpm install
pnpm exec next dev --port 5000
```

Production mode:

```bash
pnpm build
pnpm exec next start --port 5000
```

The current checkout flow collects selected products locally and opens a conversation with `@hatti_brand` on Instagram. Prices and inventory are intentionally marked as available on request until commerce data is supplied.

## Product storage: Supabase PostgreSQL + Timeweb App Platform

The storefront and `/aloidimihdyrt` admin panel use PostgreSQL when `DATABASE_URL` is set. On the first connection, the app creates `hatti_products` and `hatti_media` and seeds the 20 existing catalog cards. Later startups leave edited records intact. New product images are stored in PostgreSQL too, so an App Platform redeploy does not remove them. In local development only, the app falls back to `.data/products.json` and `.data/uploads` when `DATABASE_URL` is absent. Production requires PostgreSQL and fails closed without it.

The database lives in Supabase. Timeweb App Platform runs the Next.js site and its server-side admin API.

1. In Supabase, open the project and choose **Connect → Session pooler**. Copy the complete PostgreSQL URI. This connection mode works on IPv4 networks. Replace the password placeholder with your database password, URL-encoding reserved characters in it. Use the exact host and username from Supabase; they differ from the project URL and publishable key.
2. Deploy this project to Timeweb as a **Next.js application with SSR enabled**. Use `pnpm build` and `pnpm start` if Timeweb does not detect the commands automatically.
3. Add the copied URI to Timeweb application variables as `DATABASE_URL`. Download the database CA certificate from Supabase, base64-encode it, and set `DATABASE_SSL_CA_BASE64` for verified TLS. If the CA is already trusted by the server, `DATABASE_SSL=require` can be used instead. Do not put the URI or database password in `NEXT_PUBLIC_*` variables or Git.
4. Add `HATTI_ADMIN_USER`, `HATTI_ADMIN_SALT`, `HATTI_ADMIN_HASH`, and `HATTI_ADMIN_SESSION_KEY` as application variables. The existing local `.env.local` contains the configured values; do not upload or commit it. Never put the plain password in `HATTI_ADMIN_HASH`.
5. After deployment, open the storefront and admin panel. Confirm all 20 products are visible, edit one card, and verify it remains changed after a redeploy. Configure backups in Supabase.

The supplied `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are for Supabase's browser API and are not used by this server-side PostgreSQL integration. Do not add them for this setup. The SQL schema is in `db/schema.sql`; startup creates the tables, enables RLS, and removes `anon`/`authenticated` table grants if those roles exist. The website's server uses the database connection instead. PostgreSQL credentials are not stored in the repository. Static images for the original catalog remain in `public/products`; new uploads are stored in `hatti_media`.
