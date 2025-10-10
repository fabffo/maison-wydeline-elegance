-- Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('ADMIN', 'BACKOFFICE', 'USER');

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'ADMIN'));

-- Create products table for stock management
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  color TEXT,
  material TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create product_variants table for size-based stock
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size INTEGER NOT NULL CHECK (size >= 41 AND size <= 46),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  alert_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (product_id, size)
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create stock_movements table for history tracking
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size INTEGER NOT NULL,
  quantity_change INTEGER NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN')),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Update order_status enum to include new states
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'A_PREPARER';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'EXPEDIE';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'LIVRE';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'RETOUR';

-- Create shipments table for delivery tracking
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  carrier TEXT,
  tracking_number TEXT,
  shipment_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create notifications table for admin alerts
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ORDER_CREATED', 'INVOICE_GENERATED', 'LOW_STOCK')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for products (admin/backoffice can manage, public can view)
CREATE POLICY "Public can view products"
ON public.products
FOR SELECT
USING (true);

CREATE POLICY "Admin and backoffice can manage products"
ON public.products
FOR ALL
USING (
  public.has_role(auth.uid(), 'ADMIN') OR 
  public.has_role(auth.uid(), 'BACKOFFICE')
);

-- RLS policies for product_variants
CREATE POLICY "Public can view product variants"
ON public.product_variants
FOR SELECT
USING (true);

CREATE POLICY "Admin and backoffice can manage variants"
ON public.product_variants
FOR ALL
USING (
  public.has_role(auth.uid(), 'ADMIN') OR 
  public.has_role(auth.uid(), 'BACKOFFICE')
);

-- RLS policies for stock_movements
CREATE POLICY "Admin and backoffice can view stock movements"
ON public.stock_movements
FOR SELECT
USING (
  public.has_role(auth.uid(), 'ADMIN') OR 
  public.has_role(auth.uid(), 'BACKOFFICE')
);

CREATE POLICY "Admin and backoffice can create stock movements"
ON public.stock_movements
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'ADMIN') OR 
  public.has_role(auth.uid(), 'BACKOFFICE')
);

-- RLS policies for shipments
CREATE POLICY "Users can view their own shipments"
ON public.shipments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = shipments.order_id
    AND (orders.user_id = auth.uid() OR orders.customer_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ))
  )
);

CREATE POLICY "Admin and backoffice can manage shipments"
ON public.shipments
FOR ALL
USING (
  public.has_role(auth.uid(), 'ADMIN') OR 
  public.has_role(auth.uid(), 'BACKOFFICE')
);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Update triggers for updated_at columns
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize products from existing data in products.json
CREATE OR REPLACE FUNCTION public.sync_products_from_json()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function will be called from the application to sync products
  RETURN;
END;
$$;

-- Function to reserve stock after payment
CREATE OR REPLACE FUNCTION public.reserve_stock_for_order(
  _order_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _item RECORD;
BEGIN
  FOR _item IN
    SELECT product_id, size, quantity
    FROM order_items
    WHERE order_id = _order_id
  LOOP
    -- Decrease stock
    UPDATE product_variants
    SET stock_quantity = stock_quantity - _item.quantity
    WHERE product_id = _item.product_id AND size = _item.size;
    
    -- Log movement
    INSERT INTO stock_movements (
      product_id, size, quantity_change, movement_type, reference_id, created_by
    ) VALUES (
      _item.product_id, _item.size, -_item.quantity, 'SALE', _order_id, auth.uid()
    );
  END LOOP;
END;
$$;

-- Function to create notification for admins
CREATE OR REPLACE FUNCTION public.notify_admins(
  _type TEXT,
  _title TEXT,
  _message TEXT,
  _reference_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, reference_id)
  SELECT user_id, _type, _title, _message, _reference_id
  FROM user_roles
  WHERE role IN ('ADMIN', 'BACKOFFICE');
END;
$$;