-- Allow admins to insert profiles for any user
CREATE POLICY "Admins can insert all profiles"
ON public.profiles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));