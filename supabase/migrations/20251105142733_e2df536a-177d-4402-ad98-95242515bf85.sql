-- Fix RLS policy for order_items to be case-insensitive on email comparison
DROP POLICY IF EXISTS "Users can view items from their orders" ON public.order_items;

CREATE POLICY "Users can view items from their orders"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (
      has_role(auth.uid(), 'ADMIN'::app_role) 
      OR has_role(auth.uid(), 'BACKOFFICE'::app_role) 
      OR (orders.user_id = auth.uid()) 
      OR (LOWER(orders.customer_email) = LOWER(current_user_email()))
    )
  )
);