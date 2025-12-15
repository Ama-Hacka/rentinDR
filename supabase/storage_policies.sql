-- Create bucket (public read)
select storage.create_bucket('property-images', public => true);

-- Public read (optional when bucket is public)
create policy "Public read property-images"
on storage.objects for select
using (bucket_id = 'property-images');

-- Authenticated users can upload only to their own top-level folder (auth.uid()/...)
create policy "Users upload to their folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'property-images'
  and auth.uid() is not null
  and name like auth.uid()::text || '/%'
);

-- Authenticated users can update their own files
create policy "Users update their files"
on storage.objects for update to authenticated
using (
  bucket_id = 'property-images'
  and name like auth.uid()::text || '/%'
)
with check (
  bucket_id = 'property-images'
  and name like auth.uid()::text || '/%'
);

-- Authenticated users can delete their own files
create policy "Users delete their files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'property-images'
  and name like auth.uid()::text || '/%'
);
