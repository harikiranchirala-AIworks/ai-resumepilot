CREATE TABLE public.resume_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title TEXT NOT NULL CHECK (char_length(job_title) BETWEEN 1 AND 200),
  company TEXT NOT NULL CHECK (char_length(company) BETWEEN 1 AND 200),
  location TEXT NOT NULL DEFAULT '' CHECK (char_length(location) <= 200),
  job_url TEXT CHECK (job_url IS NULL OR char_length(job_url) <= 2000),
  job_summary TEXT NOT NULL CHECK (char_length(job_summary) BETWEEN 1 AND 12000),
  tailored_result JSONB NOT NULL CHECK (octet_length(tailored_result::text) <= 100000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
  CONSTRAINT resume_shares_expiry_window CHECK (expires_at > created_at AND expires_at <= created_at + interval '90 days')
);

GRANT SELECT, INSERT ON public.resume_shares TO anon;
GRANT SELECT, INSERT ON public.resume_shares TO authenticated;
GRANT ALL ON public.resume_shares TO service_role;

ALTER TABLE public.resume_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bounded resume shares"
ON public.resume_shares
FOR INSERT
TO anon, authenticated
WITH CHECK (expires_at > now() AND expires_at <= now() + interval '90 days');

CREATE POLICY "Anyone with a share id can view active resume shares"
ON public.resume_shares
FOR SELECT
TO anon, authenticated
USING (expires_at > now());

CREATE INDEX resume_shares_expires_at_idx ON public.resume_shares (expires_at);