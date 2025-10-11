-- Create function to automatically update order status based on shipment
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

-- Create trigger on shipments table
DROP TRIGGER IF EXISTS trigger_update_order_status ON public.shipments;
CREATE TRIGGER trigger_update_order_status
AFTER INSERT OR UPDATE OF shipment_date, delivery_date ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.update_order_status_from_shipment();

-- Update existing orders based on current shipments
UPDATE orders o
SET status = 'LIVRE'::order_status
FROM shipments s
WHERE o.id = s.order_id 
AND s.delivery_date IS NOT NULL
AND o.status != 'LIVRE'::order_status;

UPDATE orders o
SET status = 'EXPEDIE'::order_status
FROM shipments s
WHERE o.id = s.order_id 
AND s.shipment_date IS NOT NULL
AND s.delivery_date IS NULL
AND o.status NOT IN ('EXPEDIE'::order_status, 'LIVRE'::order_status);