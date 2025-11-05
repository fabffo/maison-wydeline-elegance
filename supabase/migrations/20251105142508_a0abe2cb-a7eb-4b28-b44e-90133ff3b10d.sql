-- Fix RLS policy for orders to be case-insensitive on email comparison
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'ADMIN'::app_role) 
  OR has_role(auth.uid(), 'BACKOFFICE'::app_role) 
  OR (auth.uid() = user_id) 
  OR (LOWER(customer_email) = LOWER(current_user_email()))
);