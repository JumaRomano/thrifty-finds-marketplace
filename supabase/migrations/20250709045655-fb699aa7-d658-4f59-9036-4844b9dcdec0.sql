
-- Update profiles table to ensure role column has proper constraints
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'buyer';
ALTER TABLE public.profiles ADD CONSTRAINT valid_roles CHECK (role IN ('buyer', 'seller', 'admin'));

-- Create a seller_bids view for easier bid management
CREATE OR REPLACE VIEW public.seller_bids AS
SELECT 
  b.id as bid_id,
  b.amount,
  b.created_at as bid_time,
  b.product_id,
  p.title as product_title,
  p.current_price,
  p.seller_id,
  bp.full_name as bidder_name,
  bp.email as bidder_email
FROM public.bids b
JOIN public.products p ON b.product_id = p.id
JOIN public.profiles bp ON b.bidder_id = bp.id
ORDER BY b.created_at DESC;

-- Add RLS policy for seller_bids view
CREATE POLICY "Sellers can view bids on their products" 
  ON public.bids 
  FOR SELECT 
  USING (
    product_id IN (
      SELECT id FROM public.products WHERE seller_id = auth.uid()
    )
  );

-- Update products policies to allow sellers to view all their products (not just active)
DROP POLICY IF EXISTS "Sellers can view own products" ON public.products;
CREATE POLICY "Sellers can view own products" 
  ON public.products 
  FOR SELECT 
  USING (seller_id = auth.uid());
