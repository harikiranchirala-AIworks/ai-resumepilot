REVOKE ALL ON FUNCTION public.create_resume_share(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.get_resume_share(UUID) FROM anon, authenticated;
DROP FUNCTION public.create_resume_share(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION public.get_resume_share(UUID);