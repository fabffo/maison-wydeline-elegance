-- Fix RLS policies for orders and related tables to avoid auth.users access issues

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view items from their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view their own shipments" ON public.shipments;

-- Create corrected policy for orders using auth.email() instead of SELECT from auth.users
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() = user_id 
  OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR has_role(auth.uid(), 'ADMIN'::app_role)
  OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
);

-- Create corrected policy for order_items
CREATE POLICY "Users can view items from their orders"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      OR has_role(auth.uid(), 'ADMIN'::app_role)
      OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
    )
  )
);

-- Create corrected policy for invoices
CREATE POLICY "Users can view their own invoices"
ON public.invoices
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = invoices.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      OR has_role(auth.uid(), 'ADMIN'::app_role)
      OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
    )
  )
);

-- Create corrected policy for shipments
CREATE POLICY "Users can view their own shipments"
ON public.shipments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = shipments.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      OR has_role(auth.uid(), 'ADMIN'::app_role)
      OR has_role(auth.uid(), 'BACKOFFICE'::app_role)
    )
  )
);