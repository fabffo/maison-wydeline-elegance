-- Add preorder fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS preorder boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preorder_pending_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS preorder_notification_threshold integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS preorder_notification_sent boolean DEFAULT false;

-- Add is_preorder field to order_items table
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS is_preorder boolean DEFAULT false;

-- Create function to increment preorder count and check threshold
CREATE OR REPLACE FUNCTION public.increment_preorder_count(
  _product_id text,
  _quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_count integer;
  _threshold integer;
  _product_name text;
  _notification_sent boolean;
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
    
    -- Notify admins
    PERFORM notify_admins(
      'PREORDER_THRESHOLD',
      'Seuil de précommandes atteint',
      format('Le produit "%s" a atteint %s précommandes (seuil: %s). Il faut passer commande auprès du fournisseur.', _product_name, _new_count, _threshold),
      NULL
    );
  END IF;
END;
$$;

-- Create function to reset preorder count when stock becomes positive
CREATE OR REPLACE FUNCTION public.reset_preorder_count_on_stock_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_total_stock integer;
  _new_total_stock integer;
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

-- Create trigger on product_variants to reset preorder count
DROP TRIGGER IF EXISTS reset_preorder_on_stock_update ON product_variants;
CREATE TRIGGER reset_preorder_on_stock_update
AFTER UPDATE OF stock_quantity ON product_variants
FOR EACH ROW
EXECUTE FUNCTION reset_preorder_count_on_stock_update();