
-- Drop ALL foreign key constraints referencing products table
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS fk_product_variants_product;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_product_id_fkey;
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS fk_stock_movements_product;

-- Update products table (main table)
UPDATE products SET id = 'mw-plates-noires' WHERE id = 'mw-plates-blanches';

-- Update all referencing tables
UPDATE product_variants SET product_id = 'mw-plates-noires' WHERE product_id = 'mw-plates-blanches';
UPDATE product_images SET product_id = 'mw-plates-noires' WHERE product_id = 'mw-plates-blanches';
UPDATE order_items SET product_id = 'mw-plates-noires' WHERE product_id = 'mw-plates-blanches';
UPDATE stock_movements SET product_id = 'mw-plates-noires' WHERE product_id = 'mw-plates-blanches';

-- Recreate foreign key constraints
ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
