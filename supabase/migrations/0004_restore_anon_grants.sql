-- =====================================================================
--  Restore API role grants
--
--  Symptom: every PostgREST call with the anon key returns 401 with an
--  empty body, while the same call with the service key returns 200. The
--  anon JWT is valid (auth endpoints accept it), so this is not a key
--  problem — the `anon` role has lost its schema grants.
--
--  Most likely cause: the DROP SCHEMA public CASCADE in the clean rebuild
--  removed the default grants, and the recreate only restored postgres and
--  service_role.
--
--  This does NOT weaken security. RLS is what protects the rows; these
--  grants only let the role reach the tables so RLS can be evaluated.
--  Without them PostgREST rejects the request before RLS is consulted.
-- =====================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Existing objects.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Anything created later.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

-- Storage needs the same treatment for the resume bucket to be reachable.
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

NOTIFY pgrst, 'reload schema';

-- Confirm: anon should now be able to reach these tables, with RLS still
-- deciding which rows come back.
SELECT grantee, table_name, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
  AND table_name IN ('jobs', 'profiles', 'sheet_progress')
GROUP BY grantee, table_name
ORDER BY table_name, grantee;
