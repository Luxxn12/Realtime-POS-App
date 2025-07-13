-- Script ini akan memperbaiki foreign key orders.created_by
-- agar mereferensikan user_profiles.id, bukan auth.users.id secara langsung.
-- Ini penting agar PostgREST dapat menginfer relasi untuk join.

DO $$
BEGIN
  -- 1. Hapus constraint foreign key lama jika ada
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_created_by_fkey;

  -- 2. Hapus kolom created_by jika ada
  ALTER TABLE orders DROP COLUMN IF EXISTS created_by;

  -- 3. Tambahkan kembali kolom created_by dengan referensi ke user_profiles(id)
  --    dan default value auth.uid()
  ALTER TABLE orders ADD COLUMN created_by UUID REFERENCES public.user_profiles(id) DEFAULT auth.uid();

  -- Opsional: Tambahkan indeks untuk performa
  CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);

  RAISE NOTICE 'Kolom orders.created_by telah diperbarui untuk mereferensikan user_profiles.id';
END $$;
