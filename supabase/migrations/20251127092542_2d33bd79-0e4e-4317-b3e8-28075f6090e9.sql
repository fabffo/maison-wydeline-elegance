-- Add UPDATE policy for orders table
CREATE POLICY "Admin and backoffice can update orders"
ON public.orders
FOR UPDATE
USING (
  has_role(auth.uid(), 'ADMIN'::app_role) OR 
  has_role(auth.uid(), 'BACKOFFICE'::app_role)
);