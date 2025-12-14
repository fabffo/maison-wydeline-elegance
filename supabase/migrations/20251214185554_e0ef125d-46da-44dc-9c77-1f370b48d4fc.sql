-- Drop existing orders SELECT policy
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create new policy without email-based access (only user_id matching for authenticated users)
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (
  has_role(auth.uid(), 'ADMIN'::app_role) 
  OR has_role(auth.uid(), 'BACKOFFICE'::app_role) 
  OR (auth.uid() = user_id)
);

-- Also update order_items policy to remove email-based access
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
    )
  )
);

-- Update invoices policy to remove email-based access  
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
    )
  )
);

-- Update shipments policy to remove email-based access
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
    )
  )
);