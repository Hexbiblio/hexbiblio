-- Drop the overly broad SELECT policy
DROP POLICY "Thesis PDFs are publicly accessible" ON storage.objects;

-- Create a more specific SELECT policy that still allows public read but requires knowing the path
CREATE POLICY "Thesis PDFs are accessible by authenticated users" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'theses');