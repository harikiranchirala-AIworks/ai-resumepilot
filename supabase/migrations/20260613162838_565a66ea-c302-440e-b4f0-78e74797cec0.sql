DROP POLICY IF EXISTS "Anyone can create bounded resume shares" ON public.resume_shares;
DROP POLICY IF EXISTS "Anyone with a share id can view active resume shares" ON public.resume_shares;
REVOKE ALL ON public.resume_shares FROM anon, authenticated;
GRANT ALL ON public.resume_shares TO service_role;