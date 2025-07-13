-- Tambah FK orders.created_by → user_profiles.id
-- Jalankan hanya sekali; gunakan IF NOT EXISTS untuk idempotensi.

DO $$
BEGIN
  -- Pastikan kolom created_by ada
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE orders
      ADD COLUMN created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
  END IF;

  -- Tambah FK ke user_profiles jika belum ada
  IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'orders_created_by_fkey'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES user_profiles(id);
  END IF;
END $$;
