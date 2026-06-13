CREATE OR REPLACE FUNCTION public.create_resume_share(
  p_job_title TEXT,
  p_company TEXT,
  p_location TEXT,
  p_job_url TEXT,
  p_job_summary TEXT,
  p_tailored_result JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  share_id UUID;
BEGIN
  IF char_length(trim(p_job_title)) NOT BETWEEN 1 AND 200
    OR char_length(trim(p_company)) NOT BETWEEN 1 AND 200
    OR char_length(coalesce(p_location, '')) > 200
    OR char_length(coalesce(p_job_url, '')) > 2000
    OR char_length(trim(p_job_summary)) NOT BETWEEN 1 AND 12000
    OR octet_length(p_tailored_result::text) > 100000 THEN
    RAISE EXCEPTION 'Invalid share payload';
  END IF;

  INSERT INTO public.resume_shares (
    job_title, company, location, job_url, job_summary, tailored_result
  ) VALUES (
    trim(p_job_title), trim(p_company), trim(coalesce(p_location, '')),
    nullif(trim(coalesce(p_job_url, '')), ''), trim(p_job_summary), p_tailored_result
  )
  RETURNING id INTO share_id;

  RETURN share_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_resume_share(p_share_id UUID)
RETURNS TABLE (
  id UUID,
  job_title TEXT,
  company TEXT,
  location TEXT,
  job_url TEXT,
  job_summary TEXT,
  tailored_result JSONB,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id, s.job_title, s.company, s.location, s.job_url, s.job_summary,
    s.tailored_result, s.created_at, s.expires_at
  FROM public.resume_shares AS s
  WHERE s.id = p_share_id AND s.expires_at > now()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.create_resume_share(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_resume_share(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_resume_share(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_resume_share(UUID) TO anon, authenticated;