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

## Product storage and Timeweb App Platform

The storefront and `/aloidimihdyrt` admin panel use PostgreSQL when `DATABASE_URL` is set. On the first connection, the app creates `hatti_products` and `hatti_media` and seeds the 20 existing catalog cards. Later startups leave edited records intact. New product images are stored in PostgreSQL too, so an App Platform redeploy does not remove them. In local development only, the app falls back to `.data/products.json` and `.data/uploads` when `DATABASE_URL` is absent. Production requires PostgreSQL and fails closed without it.

For Timeweb Cloud App Platform:

1. Create a **PostgreSQL 17** cluster in Timeweb Cloud. The default database is sufficient. Choose the same region and private network as the App Platform application when possible. The database is a separate, billable Timeweb service.
2. Deploy the project as a **Next.js application with SSR enabled**. Use `pnpm build` and `pnpm start` for the build and start commands if Timeweb does not detect them automatically.
3. Add `DATABASE_URL` as an application variable using the host, port, database name, user, and password from Timeweb's database connection tab. URL-encode special characters in the database password. For a private network connection, no additional SSL variable is needed. If connecting through the Timeweb database domain with TLS, set `DATABASE_SSL_CA_BASE64` to the base64-encoded PEM CA certificate supplied by Timeweb. `DATABASE_SSL=require` can be used if the certificate is already trusted by the system CA store.
4. Add `HATTI_ADMIN_USER`, `HATTI_ADMIN_SALT`, `HATTI_ADMIN_HASH`, and `HATTI_ADMIN_SESSION_KEY` as application variables. The existing local `.env.local` contains the configured values; do not upload or commit it. Never put the plain password in `HATTI_ADMIN_HASH`.
5. After deployment, open the storefront and admin panel. Confirm all 20 products are visible, edit one card, and verify it remains changed after a redeploy. Enable database backups in Timeweb.

The SQL schema is in `db/schema.sql`. PostgreSQL credentials are not stored in the repository. Static images for the original catalog remain in `public/products`; new uploads are stored in `hatti_media`.
