-- Skrip ini akan memastikan semua entri user_profiles memiliki full_name
-- dan membuat entri user_profiles jika ada auth.users yang belum memiliki profil.

DO $$
BEGIN
  -- 1. Masukkan profil pengguna yang hilang untuk auth.users yang sudah ada
  --    Mengambil full_name dari raw_user_meta_data atau bagian pertama email jika tidak ada
  INSERT INTO public.user_profiles (id, full_name, created_at, updated_at)
  SELECT
      au.id,
      COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1), 'Unknown User'),
      NOW(),
      NOW()
  FROM
      auth.users AS au
  LEFT JOIN
      public.user_profiles AS up ON au.id = up.id
  WHERE
      up.id IS NULL;

  -- 2. Perbarui full_name untuk profil pengguna yang sudah ada tetapi NULL atau kosong
  --    Mengambil full_name dari raw_user_meta_data atau bagian pertama email jika tidak ada
  UPDATE public.user_profiles AS up
  SET
      full_name = COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1), 'Unknown User'),
      updated_at = NOW()
  FROM
      auth.users AS au
  WHERE
      up.id = au.id
      AND (up.full_name IS NULL OR TRIM(up.full_name) = '');

  RAISE NOTICE 'Profil pengguna telah diisi ulang dan diperbarui.';
END $$;
