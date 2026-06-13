CREATE POLICY "No direct browser access to resume shares"
ON public.resume_shares
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);