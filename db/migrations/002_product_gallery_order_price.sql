BEGIN;
SELECT pg_advisory_xact_lock(1179804017);
ALTER TABLE hatti_products
  ADD COLUMN IF NOT EXISTS images jsonb,
  ADD COLUMN IF NOT EXISTS sort_order integer,
  ADD COLUMN IF NOT EXISTS price numeric(14,2) CHECK (price > 0),
  ADD COLUMN IF NOT EXISTS old_price numeric(14,2) CHECK (old_price > 0),
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'RUB' CHECK (currency IN ('RUB', 'USD', 'EUR', 'TRY')),
  ADD COLUMN IF NOT EXISTS price_from boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_price boolean NOT NULL DEFAULT true;
UPDATE hatti_products SET images = CASE WHEN image = '' THEN '[]'::jsonb
  ELSE jsonb_build_array(jsonb_build_object('src', image, 'alt', name)) END WHERE images IS NULL;
WITH ordered AS (SELECT id, (row_number() OVER (ORDER BY id) - 1)::integer AS position FROM hatti_products)
UPDATE hatti_products AS p SET sort_order = ordered.position FROM ordered WHERE p.id = ordered.id AND p.sort_order IS NULL;
ALTER TABLE hatti_products ALTER COLUMN images SET DEFAULT '[]'::jsonb, ALTER COLUMN images SET NOT NULL,
  ALTER COLUMN sort_order SET DEFAULT 0, ALTER COLUMN sort_order SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'hatti_products'::regclass AND conname = 'hatti_products_images_check') THEN
    ALTER TABLE hatti_products ADD CONSTRAINT hatti_products_images_check
      CHECK (jsonb_typeof(images) = 'array' AND jsonb_array_length(images) <= 10);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS hatti_products_sort_order_idx ON hatti_products (sort_order, id);
COMMIT;
