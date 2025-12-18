-- Fix PUBLIC_DATA_EXPOSURE: Remove public access to contact_recipients
-- The edge function now uses service role key, so public access is no longer needed
DROP POLICY IF EXISTS "Public can view active contact recipients" ON public.contact_recipients;

-- Fix OPEN_ENDPOINTS: Remove public INSERT access to email_logs
-- Edge functions use service role key which bypasses RLS, so this policy is unnecessary
DROP POLICY IF EXISTS "System can create email logs" ON public.email_logs;