-- ============================================
-- WYDELINE DATABASE EXPORT
-- Date: 2025-11-23
-- PostgreSQL Database Export
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TYPES (ENUMS)
-- ============================================

-- Create app_role enum type
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('ADMIN', 'BACKOFFICE', 'USER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create order_status enum type
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'PENDING',
    'PAID',
    'CANCELLED',
    'REFUNDED',
    'A_PREPARER',
    'EXPEDIE',
    'LIVRE',
    'RETOUR'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  color TEXT,
  material TEXT,
  price NUMERIC NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  featured_priority INTEGER,
  featured_start_at TIMESTAMP WITH TIME ZONE,
  featured_end_at TIMESTAMP WITH TIME ZONE,
  featured_label TEXT,
  featured_area TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  size INTEGER NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 3,
  alert_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id)
    REFERENCES public.products (id) ON DELETE CASCADE
);

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status public.order_status NOT NULL DEFAULT 'PENDING',
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  shipping_address JSONB,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  size INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id)
    REFERENCES public.orders (id) ON DELETE CASCADE
);

-- Table: invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id)
    REFERENCES public.orders (id) ON DELETE CASCADE,
  UNIQUE(order_id)
);

-- Table: shipments
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  carrier TEXT,
  tracking_number TEXT,
  shipment_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT shipments_order_id_fkey FOREIGN KEY (order_id)
    REFERENCES public.orders (id) ON DELETE CASCADE
);

-- Table: stock_movements
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  size INTEGER NOT NULL,
  quantity_change INTEGER NOT NULL,
  movement_type TEXT NOT NULL,
  reference_id UUID,
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id)
    REFERENCES public.products (id) ON DELETE CASCADE
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: email_logs
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: generate_invoice_number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE 'MW-' || current_year || '-%';
  
  invoice_num := 'MW-' || current_year || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN invoice_num;
END;
$$;

-- Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function: reserve_stock_for_order
CREATE OR REPLACE FUNCTION public.reserve_stock_for_order(_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Function: notify_admins
CREATE OR REPLACE FUNCTION public.notify_admins(
  _type TEXT,
  _title TEXT,
  _message TEXT,
  _reference_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, reference_id)
  SELECT user_id, _type, _title, _message, _reference_id
  FROM user_roles
  WHERE role IN ('ADMIN', 'BACKOFFICE');
END;
$$;

-- Function: current_user_email
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Function: get_user_email
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT email FROM auth.users WHERE id = _user_id;
$$;

-- Function: get_all_users
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE(id UUID, email TEXT, created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, email, created_at
  FROM auth.users
  WHERE has_role(auth.uid(), 'ADMIN'::app_role);
$$;

-- Function: sync_products_from_json
CREATE OR REPLACE FUNCTION public.sync_products_from_json()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function will be called from the application to sync products
  RETURN;
END;
$$;

-- Function: update_order_status_from_shipment
CREATE OR REPLACE FUNCTION public.update_order_status_from_shipment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If shipment has delivery date, mark order as delivered
  IF NEW.delivery_date IS NOT NULL THEN
    UPDATE orders 
    SET status = 'LIVRE'::order_status
    WHERE id = NEW.order_id;
  -- If shipment has shipment date (but no delivery), mark as shipped
  ELSIF NEW.shipment_date IS NOT NULL THEN
    UPDATE orders 
    SET status = 'EXPEDIE'::order_status
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipments_updated_at ON public.shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for order status from shipment
DROP TRIGGER IF EXISTS update_order_status_on_shipment ON public.shipments;
CREATE TRIGGER update_order_status_on_shipment
  AFTER INSERT OR UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_status_from_shipment();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin and backoffice can manage products" ON public.products;
CREATE POLICY "Admin and backoffice can manage products" ON public.products
  FOR ALL USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR 
    has_role(auth.uid(), 'BACKOFFICE'::app_role)
  );

-- RLS Policies for product_variants
DROP POLICY IF EXISTS "Public can view product variants" ON public.product_variants;
CREATE POLICY "Public can view product variants" ON public.product_variants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin and backoffice can manage variants" ON public.product_variants;
CREATE POLICY "Admin and backoffice can manage variants" ON public.product_variants
  FOR ALL USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR 
    has_role(auth.uid(), 'BACKOFFICE'::app_role)
  );

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'ADMIN'::app_role));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (has_role(auth.uid(), 'ADMIN'::app_role));

DROP POLICY IF EXISTS "Admins can insert all profiles" ON public.profiles;
CREATE POLICY "Admins can insert all profiles" ON public.profiles
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (has_role(auth.uid(), 'ADMIN'::app_role));

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- RLS Policies for orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR 
    has_role(auth.uid(), 'BACKOFFICE'::app_role) OR
    auth.uid() = user_id OR
    lower(customer_email) = lower(current_user_email())
  );

-- RLS Policies for order_items
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view items from their orders" ON public.order_items;
CREATE POLICY "Users can view items from their orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (
          has_role(auth.uid(), 'ADMIN'::app_role) OR
          has_role(auth.uid(), 'BACKOFFICE'::app_role) OR
          orders.user_id = auth.uid() OR
          lower(orders.customer_email) = lower(current_user_email())
        )
    )
  );

-- RLS Policies for invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = invoices.order_id
        AND (
          has_role(auth.uid(), 'ADMIN'::app_role) OR
          has_role(auth.uid(), 'BACKOFFICE'::app_role) OR
          orders.user_id = auth.uid() OR
          orders.customer_email = current_user_email()
        )
    )
  );

-- RLS Policies for shipments
DROP POLICY IF EXISTS "Admin and backoffice can manage shipments" ON public.shipments;
CREATE POLICY "Admin and backoffice can manage shipments" ON public.shipments
  FOR ALL USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR 
    has_role(auth.uid(), 'BACKOFFICE'::app_role)
  );

DROP POLICY IF EXISTS "Users can view their own shipments" ON public.shipments;
CREATE POLICY "Users can view their own shipments" ON public.shipments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = shipments.order_id
        AND (
          has_role(auth.uid(), 'ADMIN'::app_role) OR
          has_role(auth.uid(), 'BACKOFFICE'::app_role) OR
          orders.user_id = auth.uid() OR
          orders.customer_email = current_user_email()
        )
    )
  );

-- RLS Policies for stock_movements
DROP POLICY IF EXISTS "Admin and backoffice can view stock movements" ON public.stock_movements;
CREATE POLICY "Admin and backoffice can view stock movements" ON public.stock_movements
  FOR SELECT USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR 
    has_role(auth.uid(), 'BACKOFFICE'::app_role)
  );

DROP POLICY IF EXISTS "Admin and backoffice can create stock movements" ON public.stock_movements;
CREATE POLICY "Admin and backoffice can create stock movements" ON public.stock_movements
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'ADMIN'::app_role) OR 
    has_role(auth.uid(), 'BACKOFFICE'::app_role)
  );

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for email_logs
DROP POLICY IF EXISTS "Admin and backoffice can view email logs" ON public.email_logs;
CREATE POLICY "Admin and backoffice can view email logs" ON public.email_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR 
    has_role(auth.uid(), 'BACKOFFICE'::app_role)
  );

DROP POLICY IF EXISTS "System can create email logs" ON public.email_logs;
CREATE POLICY "System can create email logs" ON public.email_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- DATA INSERTS
-- ============================================

-- Insert products
INSERT INTO public.products (id, name, category, description, color, material, price, is_featured, featured_priority, featured_start_at, featured_end_at, featured_label, featured_area, created_at, updated_at) VALUES
('mw-bottes-noires-nappa', 'Bottes Noires Nappa', 'Bottes', 'Bottes hautes en cuir nappa noir, ligne épurée et confort longue durée.', 'Noir', 'Cuir nappa', 290, true, 0, NULL, NULL, NULL, 'NEW', '2025-10-11 14:08:56.93475+00', '2025-11-05 10:33:12.851411+00'),
('mw-bottes-vertes-truffe', 'Bottes Vertes Truffe', 'Bottes', 'Bottes en daim vert truffe, silhouette élancée et talon confortable.', 'Vert truffe', 'Daim', 290, true, 0, NULL, NULL, 'la promo du moment', '', '2025-10-11 14:08:57.356159+00', '2025-11-05 10:33:13.24281+00'),
('mw-bottines-bordeaux', 'Bottines Bordeaux', 'Bottines', 'Bottines en cuir bordeaux, talon modéré pour un confort quotidien.', 'Bordeaux', 'Cuir', 240, false, NULL, NULL, NULL, NULL, NULL, '2025-10-11 14:08:57.733775+00', '2025-11-05 10:33:13.613557+00'),
('mw-bottines-daim-noires', 'Bottines Daim Noires', 'Bottines', 'Bottines en daim noir, texture douce et silhouette minimaliste.', 'Noir', 'Daim', 230, true, 0, NULL, NULL, 'The bottines', 'BEST', '2025-10-11 14:08:58.137596+00', '2025-11-05 10:33:14.012276+00'),
('mw-bottines-noires', 'Bottines Noires', 'Bottines', 'Bottines en cuir noir, design intemporel et stabilité assurée.', 'Noir', 'Cuir', 230, false, NULL, NULL, NULL, NULL, NULL, '2025-10-11 14:08:58.495834+00', '2025-11-05 10:33:14.422117+00'),
('mw-plates-blanches', 'Chaussures Plates Blanches', 'Plats', 'Chaussures plates en cuir blanc, souples et légères.', 'Blanc', 'Cuir', 160, false, NULL, NULL, NULL, NULL, NULL, '2025-10-11 14:08:58.842533+00', '2025-11-05 10:33:14.795624+00'),
('mw-slingback-bordeaux', 'Slingback Bordeaux', 'Escarpins', 'Slingbacks en cuir verni bordeaux, bride réglable et allure chic.', 'Bordeaux', 'Cuir verni', 210, false, NULL, NULL, NULL, NULL, NULL, '2025-10-11 14:08:59.218711+00', '2025-11-05 10:33:15.236568+00'),
('mw-slingback-camel', 'Slingback Camel', 'Escarpins', 'Slingbacks en daim camel, talon modéré et confort de marche.', 'Camel', 'Daim', 205, false, NULL, NULL, NULL, NULL, NULL, '2025-10-11 14:08:59.578389+00', '2025-11-05 10:33:15.635893+00'),
('mw-slingback-jeans', 'Slingback Jeans', 'Escarpins', 'Slingbacks en textile bleu jeans, look casual chic.', 'Bleu jeans', 'Textile', 205, false, NULL, NULL, NULL, NULL, NULL, '2025-10-11 14:08:59.920854+00', '2025-11-05 10:33:16.328985+00')
ON CONFLICT (id) DO NOTHING;

-- Insert product_variants (stock data)
INSERT INTO public.product_variants (id, product_id, size, stock_quantity, low_stock_threshold, alert_threshold, created_at, updated_at) VALUES
('70d94c51-ead6-416d-ade7-6bf19af32d6e', 'mw-bottes-noires-nappa', 41, 8, 3, 5, '2025-10-11 14:08:57.018888+00', '2025-11-05 10:33:12.906446+00'),
('8c5d4299-a3ca-4868-9092-7ca5e8cef492', 'mw-bottes-noires-nappa', 42, 10, 3, 5, '2025-10-11 14:08:57.082235+00', '2025-11-05 10:33:12.977998+00'),
('b0e59535-267a-4961-adfc-003402c6b3aa', 'mw-bottes-noires-nappa', 43, 6, 3, 5, '2025-10-11 14:08:57.138861+00', '2025-11-05 10:33:13.031418+00'),
('9f67283f-858f-4086-9304-3fa63b40b2e8', 'mw-bottes-noires-nappa', 44, 4, 3, 5, '2025-10-11 14:08:57.189276+00', '2025-11-05 14:13:33.220107+00'),
('a4130dd1-1382-43f1-a3b3-5ea811b15d49', 'mw-bottes-noires-nappa', 45, 3, 3, 5, '2025-10-11 14:08:57.24746+00', '2025-11-05 14:35:30.056805+00'),
('768f49b3-39e6-48f5-8ae3-2c334c5281f5', 'mw-bottes-noires-nappa', 46, 2, 3, 5, '2025-10-11 14:08:57.303122+00', '2025-11-05 11:32:13.404378+00'),
('f8b9b766-8ac2-4c81-96ef-031053104aed', 'mw-bottes-vertes-truffe', 41, 5, 3, 5, '2025-10-11 14:08:57.412127+00', '2025-11-05 10:33:13.295219+00'),
('203efdcd-48fa-4937-966d-bbf6c9a978d3', 'mw-bottes-vertes-truffe', 42, 7, 3, 5, '2025-10-11 14:08:57.464501+00', '2025-11-05 10:33:13.345078+00'),
('bfe22a44-3103-4c73-9e36-4fe16bbf2d83', 'mw-bottes-vertes-truffe', 43, 4, 3, 5, '2025-10-11 14:08:57.521048+00', '2025-11-05 14:07:55.58356+00'),
('d6355739-d48e-42e4-b68d-e692eb5c4f5a', 'mw-bottes-vertes-truffe', 44, 4, 3, 5, '2025-10-11 14:08:57.568391+00', '2025-11-05 10:33:13.447695+00'),
('4cda6b66-0f1c-4f1d-aee8-2fcb7aed1a41', 'mw-bottes-vertes-truffe', 45, 3, 3, 5, '2025-10-11 14:08:57.620769+00', '2025-11-05 10:33:13.495917+00'),
('2d067b59-08a6-452d-984d-29a1c5b667d1', 'mw-bottes-vertes-truffe', 46, 1, 3, 5, '2025-10-11 14:08:57.683216+00', '2025-11-05 15:19:22.390791+00'),
('b36614e7-d857-4a60-ab63-42de0769d018', 'mw-bottines-bordeaux', 41, 9, 3, 5, '2025-10-11 14:08:57.796333+00', '2025-11-05 10:33:13.669164+00'),
('322571a8-7a15-4273-8a12-831c9a7358b3', 'mw-bottines-bordeaux', 42, 9, 3, 5, '2025-10-11 14:08:57.849561+00', '2025-11-05 10:33:13.736368+00'),
('0f41e4fd-c602-4b74-9e7e-69699bdd783e', 'mw-bottines-bordeaux', 43, 5, 3, 5, '2025-10-11 14:08:57.90397+00', '2025-11-06 14:06:07.917353+00'),
('73adb0e5-885a-4561-b8a5-d1621ed4ff74', 'mw-bottines-bordeaux', 44, 5, 3, 5, '2025-10-11 14:08:57.960575+00', '2025-11-05 10:33:13.856919+00'),
('67e596f9-c296-4f8e-beaf-8d62281c1c2c', 'mw-bottines-bordeaux', 45, 3, 3, 5, '2025-10-11 14:08:58.010702+00', '2025-11-05 14:35:30.056805+00'),
('daf87a32-a262-4700-8b05-52415f45caea', 'mw-bottines-bordeaux', 46, 2, 3, 5, '2025-10-11 14:08:58.078893+00', '2025-11-06 14:06:07.917353+00'),
('91b9533e-8745-47a3-853f-94950ca7e290', 'mw-bottines-daim-noires', 41, 7, 3, 5, '2025-10-11 14:08:58.186882+00', '2025-11-05 10:33:14.065833+00'),
('5d3f1f6c-9577-4fc2-a602-7ea691c36225', 'mw-bottines-daim-noires', 42, 8, 3, 5, '2025-10-11 14:08:58.233723+00', '2025-11-05 10:33:14.120757+00'),
('f30cf16b-b3a2-4670-a4d6-4a075bb5159d', 'mw-bottines-daim-noires', 43, 6, 3, 5, '2025-10-11 14:08:58.287142+00', '2025-11-05 10:33:14.173358+00'),
('b983b5d2-c40b-4cd8-95d1-ac6487b93dcf', 'mw-bottines-daim-noires', 44, 4, 3, 5, '2025-10-11 14:08:58.335357+00', '2025-11-06 14:06:07.917353+00'),
('65cfd4c6-e7c1-4fe9-87e3-c52dcf21f2db', 'mw-bottines-daim-noires', 45, 4, 3, 5, '2025-10-11 14:08:58.389079+00', '2025-11-06 14:06:07.917353+00'),
('97e0ac43-bc00-43d9-a41a-8e45a27b74e5', 'mw-bottines-daim-noires', 46, 2, 3, 5, '2025-10-11 14:08:58.437821+00', '2025-11-05 10:33:14.363491+00'),
('0f7c20f6-9603-478b-89b9-83a41c76d652', 'mw-bottines-noires', 41, 8, 3, 5, '2025-10-11 14:08:58.537911+00', '2025-11-05 10:33:14.476092+00'),
('01fe9154-96f5-49ab-aecc-2cf9e8c5f0ec', 'mw-bottines-noires', 42, 10, 3, 5, '2025-10-11 14:08:58.594602+00', '2025-11-05 10:33:14.531096+00'),
('07ff6a20-5e18-4e4e-8bd3-ac92c4e16e23', 'mw-bottines-noires', 43, 6, 3, 5, '2025-10-11 14:08:58.640742+00', '2025-11-05 10:33:14.585129+00'),
('7bb5da6b-79c5-4d48-96fc-7dfedeceaa36', 'mw-bottines-noires', 44, 4, 3, 5, '2025-10-11 14:08:58.688912+00', '2025-11-12 13:45:24.891088+00'),
('d5c7c99f-35b6-42c1-bd35-cbd2b6a61584', 'mw-bottines-noires', 45, 3, 3, 5, '2025-10-11 14:08:58.736491+00', '2025-11-05 10:33:14.688145+00'),
('0a50b2e5-cc4c-4d0d-be9f-e8e0f7b9a332', 'mw-bottines-noires', 46, 2, 3, 5, '2025-10-11 14:08:58.786421+00', '2025-11-05 10:33:14.743166+00'),
('a5e6e2fd-caa7-4c7c-bbb2-7acd5f8e9b91', 'mw-plates-blanches', 41, 9, 3, 5, '2025-10-11 14:08:58.890428+00', '2025-11-05 10:33:14.851652+00'),
('ca5b0f42-d57b-4f4f-93cd-36c03e13856c', 'mw-plates-blanches', 42, 11, 3, 5, '2025-10-11 14:08:58.942666+00', '2025-11-05 10:33:14.906665+00'),
('53defc06-cf9c-4fd9-81c5-a21dc1e5f50f', 'mw-plates-blanches', 43, 6, 3, 5, '2025-10-11 14:08:58.991733+00', '2025-11-05 10:33:14.963725+00'),
('f3d02d41-ba30-4f3f-b3c1-3ed0b5c29e4d', 'mw-plates-blanches', 44, 5, 3, 5, '2025-10-11 14:08:59.040681+00', '2025-11-05 10:33:15.019729+00'),
('04e2eef3-8d4d-4c28-a1fc-a1fa12ec28b3', 'mw-plates-blanches', 45, 3, 3, 5, '2025-10-11 14:08:59.092662+00', '2025-11-05 15:19:22.390791+00'),
('74e2a0b9-8f67-4d74-99fc-caeec5e3c44a', 'mw-plates-blanches', 46, 2, 3, 5, '2025-10-11 14:08:59.159632+00', '2025-11-05 10:33:15.131641+00'),
('32889a94-80c3-4b8f-9d6e-5e6f8d08c5c2', 'mw-slingback-bordeaux', 41, 7, 3, 5, '2025-10-11 14:08:59.286762+00', '2025-11-05 10:33:15.293595+00'),
('4d28e45d-94c3-4e29-893f-8a8b3d8f9e1f', 'mw-slingback-bordeaux', 42, 9, 3, 5, '2025-10-11 14:08:59.338764+00', '2025-11-05 10:33:15.349699+00'),
('1eb4d5c3-f8a4-4c95-b17c-5e8e6a6d2e4b', 'mw-slingback-bordeaux', 43, 5, 3, 5, '2025-10-11 14:08:59.386818+00', '2025-11-05 10:33:15.405705+00'),
('df6c2a8e-5d4b-4d3f-a8f5-9e8b4d6c2e1f', 'mw-slingback-bordeaux', 44, 4, 3, 5, '2025-10-11 14:08:59.43586+00', '2025-11-05 10:33:15.461721+00'),
('8a5e3d2f-4c6b-4d8e-9f7a-6e5d4c3b2a1f', 'mw-slingback-bordeaux', 45, 3, 3, 5, '2025-10-11 14:08:59.486915+00', '2025-11-05 10:33:15.517767+00'),
('2f4d6e8a-3c5d-4e7f-8a9b-5d6e7f8a9b0c', 'mw-slingback-bordeaux', 46, 1, 3, 5, '2025-10-11 14:08:59.531961+00', '2025-11-05 10:33:15.573734+00'),
('5d7f9a2c-4e6d-4a8f-9c7b-6e5d4c3b2a1e', 'mw-slingback-camel', 41, 6, 3, 5, '2025-10-11 14:08:59.625013+00', '2025-11-05 10:33:15.689739+00'),
('8a6d9c2e-5f7a-4b8d-9e6c-7d5e4c3b2a1f', 'mw-slingback-camel', 42, 8, 3, 5, '2025-10-11 14:08:59.673062+00', '2025-11-05 10:33:15.742735+00'),
('2e5d7f9a-4c6b-4d8e-9f7a-6e5d4c3b2a1e', 'mw-slingback-camel', 43, 4, 3, 5, '2025-10-11 14:08:59.722108+00', '2025-11-05 10:33:15.800744+00'),
('6f8a9c2d-5e7b-4a8d-9c7e-6d5e4c3b2a1f', 'mw-slingback-camel', 44, 4, 3, 5, '2025-10-11 14:08:59.770155+00', '2025-11-05 10:33:15.859748+00'),
('9d7f8a6c-4e5b-4a8d-9c7f-6e5d4c3b2a1e', 'mw-slingback-camel', 45, 3, 3, 5, '2025-10-11 14:08:59.817204+00', '2025-11-05 10:33:15.918751+00'),
('3c6d8f9a-5e7b-4a8d-9c7e-6d5e4c3b2a1f', 'mw-slingback-camel', 46, 1, 3, 5, '2025-10-11 14:08:59.864256+00', '2025-11-05 10:33:15.976764+00'),
('7f9a2d5e-4c6b-4a8d-9e7c-6d5e4c3b2a1f', 'mw-slingback-jeans', 41, 5, 3, 5, '2025-10-11 14:08:59.974363+00', '2025-11-05 10:33:16.379005+00'),
('2d6f8a9c-5e7b-4a8d-9c7e-6d5e4c3b2a1f', 'mw-slingback-jeans', 42, 7, 3, 5, '2025-10-11 14:09:00.022409+00', '2025-11-05 10:33:16.435002+00'),
('8c9f2d5e-4a6b-4d8e-9f7c-6e5d4c3b2a1f', 'mw-slingback-jeans', 43, 4, 3, 5, '2025-10-11 14:09:00.069458+00', '2025-11-06 14:06:07.917353+00'),
('5e7a9c2d-4f6b-4a8d-9e7c-6d5e4c3b2a1f', 'mw-slingback-jeans', 44, 4, 3, 5, '2025-10-11 14:09:00.118552+00', '2025-11-05 14:35:30.056805+00'),
('9d6f8a2c-5e7b-4a8d-9c7e-6d5e4c3b2a1f', 'mw-slingback-jeans', 45, 2, 3, 5, '2025-10-11 14:09:00.165554+00', '2025-11-06 14:06:07.917353+00'),
('2e5d7f9a-4c6b-4d8e-9f7a-6e5d4c3b2a2e', 'mw-slingback-jeans', 46, 1, 3, 5, '2025-10-11 14:09:00.213602+00', '2025-11-05 10:33:16.658029+00')
ON CONFLICT (id) DO NOTHING;

-- Note: Profiles, user_roles, orders, order_items, invoices, shipments, stock_movements, notifications, and email_logs
-- data is user-specific and typically should NOT be included in a standard database export.
-- If needed for a complete backup, these would be included but are omitted here for security and privacy.

-- ============================================
-- END OF EXPORT
-- ============================================