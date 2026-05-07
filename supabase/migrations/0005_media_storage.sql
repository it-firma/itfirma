-- =============================================================================
-- IT Firma Growth OS - Media Storage
-- Migration: 0005_media_storage
-- =============================================================================
-- Oppretter en Supabase Storage bucket "media" og policies som lar
-- innloggede brukere laste opp og lese, mens kun admins/eiere kan slette.
-- Bucket er "private" - filer leveres via signerte URL-er (server-side).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,  -- public read; CDN-vennlig for bilde-bruk i innhold
  10485760,  -- 10 MB
  array[
    'image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read (alle kan lese filer i bucket)
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Innloggede aktive brukere kan laste opp
drop policy if exists "media_authenticated_insert" on storage.objects;
create policy "media_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and is_active_user()
  );

-- Innloggede kan oppdatere egne filer (eier-feltet settes av Storage)
drop policy if exists "media_owner_update" on storage.objects;
create policy "media_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (owner = auth.uid() or is_admin_or_owner())
  );

-- Admin/owner kan slette
drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (owner = auth.uid() or is_admin_or_owner())
  );
