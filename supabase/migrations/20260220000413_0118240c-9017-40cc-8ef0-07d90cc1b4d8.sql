
-- Create storage bucket for card/item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload item images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to item images
CREATE POLICY "Item images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own item images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);
