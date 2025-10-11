-- Fix RLS policies to avoid auth.users access issues
-- Create a security definer function to get current user email

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Drop and recreate policies without auth.users access in RLS

-- Orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  has_role(auth.uid(), 'ADMIN'::app_role)
  OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
  OR auth.uid() = user_id 
  OR customer_email = current_user_email()
);

-- Order items policies
DROP POLICY IF EXISTS "Users can view items from their orders" ON public.order_items;
CREATE POLICY "Users can view items from their orders"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      has_role(auth.uid(), 'ADMIN'::app_role)
      OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
      OR orders.user_id = auth.uid() 
      OR orders.customer_email = current_user_email()
    )
  )
);

-- Invoices policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices"
ON public.invoices
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = invoices.order_id 
    AND (
      has_role(auth.uid(), 'ADMIN'::app_role)
      OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
      OR orders.user_id = auth.uid() 
      OR orders.customer_email = current_user_email()
    )
  )
);

-- Shipments policies
DROP POLICY IF EXISTS "Users can view their own shipments" ON public.shipments;
CREATE POLICY "Users can view their own shipments"
ON public.shipments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = shipments.order_id 
    AND (
      has_role(auth.uid(), 'ADMIN'::app_role)
      OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
      OR orders.user_id = auth.uid() 
      OR orders.customer_email = current_user_email()
    )
  )
);