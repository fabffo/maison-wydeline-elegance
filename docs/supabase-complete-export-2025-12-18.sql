-- ============================================================
-- EXPORT COMPLET SUPABASE - MAISON WYDELINE
-- Date d'export: 2025-12-18
-- Projet: dxiruklqwidvtqwaeflr
-- 
-- Ce fichier contient:
-- - Types énumérés (ENUM)
-- - Tables avec contraintes
-- - Index
-- - Fonctions
-- - Triggers
-- - Politiques RLS
-- - Configuration Storage
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. TYPES ÉNUMÉRÉS (ENUM)
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('ADMIN', 'BACKOFFICE', 'USER');
CREATE TYPE public.order_status AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED', 'A_PREPARER', 'EXPEDIE', 'LIVRE', 'RETOUR');

-- ============================================================
-- 3. TABLES
-- ============================================================

-- 3.1 TVA Rates (Taux de TVA)
CREATE TABLE public.tva_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.2 Products (Produits)
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    color TEXT,
    material TEXT,
    slug TEXT UNIQUE,
    alt_text TEXT,
    tags TEXT[],
    tva_rate_id UUID REFERENCES public.tva_rates(id),
    heel_height_cm NUMERIC,
    characteristics JSONB DEFAULT '{}'::jsonb,
    reference_fournisseur TEXT,
    description_fournisseur TEXT,
    is_featured BOOLEAN DEFAULT false,
    featured_priority INTEGER,
    featured_area TEXT,
    featured_label TEXT,
    featured_start_at TIMESTAMP WITH TIME ZONE,
    featured_end_at TIMESTAMP WITH TIME ZONE,
    preorder BOOLEAN DEFAULT false,
    preorder_pending_count INTEGER DEFAULT 0,
    preorder_notification_threshold INTEGER DEFAULT 10,
    preorder_notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.3 Product Variants (Variantes de produits - Tailles/Stock)
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size INTEGER NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    alert_threshold INTEGER DEFAULT 5,
    low_stock_threshold INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_product_variant UNIQUE (product_id, size)
);

-- 3.4 Product Images (Images produits)
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.5 Profiles (Profils utilisateurs)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.6 User Roles (Rôles utilisateurs)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- 3.7 Orders (Commandes)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    status public.order_status NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    shipping_address JSONB,
    stripe_payment_intent_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.8 Order Items (Articles de commande)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    is_preorder BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.9 Invoices (Factures)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id),
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.10 Shipments (Expéditions)
CREATE TABLE public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    carrier TEXT,
    tracking_number TEXT,
    shipment_date TIMESTAMP WITH TIME ZONE,
    delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.11 Stock Movements (Mouvements de stock)
CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id),
    size INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    movement_type TEXT NOT NULL,
    reference_id UUID,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.12 Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.13 Email Logs (Journal des emails)
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    email_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.14 Contact Recipients (Destinataires contact)
CREATE TABLE public.contact_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.15 Newsletter Subscribers (Abonnés newsletter)
CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    source TEXT DEFAULT 'coming_soon',
    subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. INDEX
-- ============================================================
CREATE INDEX idx_products_slug ON public.products USING btree (slug);
CREATE INDEX idx_products_featured ON public.products USING btree (is_featured, featured_area, featured_priority) WHERE (is_featured = true);
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_stripe_payment_intent ON public.orders USING btree (stripe_payment_intent_id);
CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);
CREATE INDEX idx_invoices_order_id ON public.invoices USING btree (order_id);
CREATE INDEX idx_invoices_number ON public.invoices USING btree (invoice_number);
CREATE INDEX idx_email_logs_created_at ON public.email_logs USING btree (created_at DESC);
CREATE INDEX idx_email_logs_recipient ON public.email_logs USING btree (recipient_email);
CREATE INDEX idx_email_logs_type ON public.email_logs USING btree (email_type);

-- ============================================================
-- 5. FONCTIONS
-- ============================================================

-- 5.1 Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5.2 Génération de numéro de facture
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 5.3 Vérification de rôle utilisateur
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

-- 5.4 Réservation de stock pour commande
CREATE OR REPLACE FUNCTION public.reserve_stock_for_order(_order_id UUID)
RETURNS VOID
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

-- 5.5 Notification aux admins
CREATE OR REPLACE FUNCTION public.notify_admins(_type TEXT, _title TEXT, _message TEXT, _reference_id UUID)
RETURNS VOID
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

-- 5.6 Notification au backoffice uniquement
CREATE OR REPLACE FUNCTION public.notify_backoffice(_type TEXT, _title TEXT, _message TEXT, _reference_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, reference_id)
  SELECT user_id, _type, _title, _message, _reference_id
  FROM user_roles
  WHERE role = 'BACKOFFICE';
END;
$$;

-- 5.7 Email de l'utilisateur courant
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- 5.8 Email d'un utilisateur par ID
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = _user_id;
$$;

-- 5.9 Liste de tous les utilisateurs (admin seulement)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (id UUID, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, created_at
  FROM auth.users
  WHERE has_role(auth.uid(), 'ADMIN'::app_role);
$$;

-- 5.10 Mise à jour du statut commande selon expédition
CREATE OR REPLACE FUNCTION public.update_order_status_from_shipment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 5.11 Gestion du profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 5.12 Incrémentation compteur précommandes
CREATE OR REPLACE FUNCTION public.increment_preorder_count(_product_id TEXT, _quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_count INTEGER;
  _threshold INTEGER;
  _product_name TEXT;
  _notification_sent BOOLEAN;
BEGIN
  -- Update count and get new values
  UPDATE products
  SET preorder_pending_count = preorder_pending_count + _quantity
  WHERE id = _product_id
  RETURNING preorder_pending_count, preorder_notification_threshold, name, preorder_notification_sent
  INTO _new_count, _threshold, _product_name, _notification_sent;
  
  -- Check if threshold reached and notification not yet sent
  IF _new_count >= _threshold AND NOT _notification_sent THEN
    -- Mark notification as sent
    UPDATE products
    SET preorder_notification_sent = true
    WHERE id = _product_id;
    
    -- Notify backoffice only
    PERFORM notify_backoffice(
      'PREORDER_THRESHOLD',
      'Seuil de précommandes atteint',
      format('Le produit "%s" a atteint %s précommandes (seuil: %s). Il faut passer commande auprès du fournisseur.', _product_name, _new_count, _threshold),
      NULL
    );
  END IF;
END;
$$;

-- 5.13 Reset du compteur précommandes lors de l'ajout de stock
CREATE OR REPLACE FUNCTION public.reset_preorder_count_on_stock_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_total_stock INTEGER;
  _new_total_stock INTEGER;
BEGIN
  -- Calculate old total stock
  SELECT COALESCE(SUM(stock_quantity), 0)
  INTO _old_total_stock
  FROM product_variants
  WHERE product_id = OLD.product_id;
  
  -- Calculate new total stock
  SELECT COALESCE(SUM(stock_quantity), 0)
  INTO _new_total_stock
  FROM product_variants
  WHERE product_id = NEW.product_id;
  
  -- If stock was 0 or negative and now is positive, reset preorder count
  IF _old_total_stock <= 0 AND _new_total_stock > 0 THEN
    UPDATE products
    SET 
      preorder_pending_count = 0,
      preorder_notification_sent = false
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5.14 Placeholder pour sync JSON
CREATE OR REPLACE FUNCTION public.sync_products_from_json()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function will be called from the application to sync products
  RETURN;
END;
$$;

-- ============================================================
-- 6. TRIGGERS
-- ============================================================

-- Triggers updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tva_rates_updated_at
  BEFORE UPDATE ON public.tva_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_recipients_updated_at
  BEFORE UPDATE ON public.contact_recipients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger mise à jour statut commande depuis expédition
CREATE TRIGGER trigger_update_order_status
  AFTER INSERT OR UPDATE OF shipment_date, delivery_date ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION update_order_status_from_shipment();

-- Trigger reset précommandes lors mise à jour stock
CREATE TRIGGER reset_preorder_on_stock_update
  AFTER UPDATE OF stock_quantity ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION reset_preorder_count_on_stock_update();

-- Trigger création profil à l'inscription (sur auth.users)
-- Note: Ce trigger doit être créé sur le schéma auth
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- 7.1 Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tva_rates ENABLE ROW LEVEL SECURITY;

-- 7.2 PRODUCTS Policies
CREATE POLICY "Public can view products" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Admin and backoffice can manage products" 
  ON public.products FOR ALL 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.3 PRODUCT_VARIANTS Policies
CREATE POLICY "Public can view product variants" 
  ON public.product_variants FOR SELECT 
  USING (true);

CREATE POLICY "Admin and backoffice can manage variants" 
  ON public.product_variants FOR ALL 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.4 PRODUCT_IMAGES Policies
CREATE POLICY "Public can view product images" 
  ON public.product_images FOR SELECT 
  USING (true);

CREATE POLICY "Admin and backoffice can manage product images" 
  ON public.product_images FOR ALL 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.5 PROFILES Policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles FOR UPDATE 
  USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Admins can insert all profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));

-- 7.6 USER_ROLES Policies
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
  ON public.user_roles FOR SELECT 
  USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles FOR ALL 
  USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- 7.7 ORDERS Policies
CREATE POLICY "Anyone can create orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view their own orders" 
  ON public.orders FOR SELECT 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role) OR auth.uid() = user_id);

CREATE POLICY "Admin and backoffice can update orders" 
  ON public.orders FOR UPDATE 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.8 ORDER_ITEMS Policies
CREATE POLICY "Anyone can create order items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view items from their orders" 
  ON public.order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role) OR orders.user_id = auth.uid())
  ));

-- 7.9 INVOICES Policies
CREATE POLICY "Users can view their own invoices" 
  ON public.invoices FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = invoices.order_id 
    AND (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role) OR orders.user_id = auth.uid())
  ));

-- 7.10 SHIPMENTS Policies
CREATE POLICY "Users can view their own shipments" 
  ON public.shipments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = shipments.order_id 
    AND (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role) OR orders.user_id = auth.uid())
  ));

CREATE POLICY "Admin and backoffice can manage shipments" 
  ON public.shipments FOR ALL 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.11 STOCK_MOVEMENTS Policies
CREATE POLICY "Admin and backoffice can view stock movements" 
  ON public.stock_movements FOR SELECT 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

CREATE POLICY "Admin and backoffice can create stock movements" 
  ON public.stock_movements FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.12 NOTIFICATIONS Policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (true);

-- 7.13 EMAIL_LOGS Policies
CREATE POLICY "Admin and backoffice can view email logs" 
  ON public.email_logs FOR SELECT 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.14 CONTACT_RECIPIENTS Policies
CREATE POLICY "Admin and backoffice can manage contact recipients" 
  ON public.contact_recipients FOR ALL 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.15 NEWSLETTER_SUBSCRIBERS Policies
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscribers FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin and backoffice can view subscribers" 
  ON public.newsletter_subscribers FOR SELECT 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

CREATE POLICY "Admin and backoffice can manage subscribers" 
  ON public.newsletter_subscribers FOR ALL 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- 7.16 TVA_RATES Policies
CREATE POLICY "Public can view TVA rates" 
  ON public.tva_rates FOR SELECT 
  USING (true);

CREATE POLICY "Admin and backoffice can manage TVA rates" 
  ON public.tva_rates FOR ALL 
  USING (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role));

-- ============================================================
-- 8. STORAGE BUCKETS
-- ============================================================
-- Note: Ces commandes doivent être exécutées via l'API Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage Policies for product-images bucket
-- CREATE POLICY "Public can view product images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'product-images');

-- CREATE POLICY "Admin and backoffice can upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'product-images' AND (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role)));

-- CREATE POLICY "Admin and backoffice can delete product images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'product-images' AND (has_role(auth.uid(), 'ADMIN'::app_role) OR has_role(auth.uid(), 'BACKOFFICE'::app_role)));

-- ============================================================
-- 9. CONFIGURATION EDGE FUNCTIONS (supabase/config.toml)
-- ============================================================
/*
project_id = "dxiruklqwidvtqwaeflr"

[functions.create-checkout]
verify_jwt = false

[functions.stripe-webhook]
verify_jwt = false

[functions.send-order-confirmation]
verify_jwt = false

[functions.send-auth-email]
verify_jwt = false

[functions.send-invoice]
verify_jwt = false

[functions.send-contact-email]
verify_jwt = false
*/

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
