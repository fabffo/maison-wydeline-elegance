-- Create a security definer function to get all users for admins
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, created_at
  FROM auth.users
  WHERE has_role(auth.uid(), 'ADMIN'::app_role);
$$;