
-- New columns on surprises
ALTER TABLE public.surprises
  ADD COLUMN IF NOT EXISTS sender_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS event_at timestamptz,
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS autoplay boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS music_label text;

-- Rebuild public read policy to honor publish_at
DROP POLICY IF EXISTS "Public can read live surprises" ON public.surprises;
CREATE POLICY "Public can read live surprises"
ON public.surprises FOR SELECT
TO anon, authenticated
USING (
  is_published = true
  AND (publish_at IS NULL OR publish_at <= now())
  AND (expires_at IS NULL OR expires_at > now())
);

-- Rebuild photo/guestbook policies to respect the same condition
DROP POLICY IF EXISTS "Public reads photos of live surprises" ON public.surprise_photos;
CREATE POLICY "Public reads photos of live surprises"
ON public.surprise_photos FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.surprises s
  WHERE s.id = surprise_photos.surprise_id
    AND s.is_published = true
    AND (s.publish_at IS NULL OR s.publish_at <= now())
    AND (s.expires_at IS NULL OR s.expires_at > now())
));

DROP POLICY IF EXISTS "Anyone can read wishes on live surprises" ON public.guestbook_entries;
CREATE POLICY "Anyone can read wishes on live surprises"
ON public.guestbook_entries FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.surprises s
  WHERE s.id = guestbook_entries.surprise_id
    AND s.is_published = true
    AND (s.publish_at IS NULL OR s.publish_at <= now())
    AND (s.expires_at IS NULL OR s.expires_at > now())
));

DROP POLICY IF EXISTS "Anyone can leave a wish on a live surprise" ON public.guestbook_entries;
CREATE POLICY "Anyone can leave a wish on a live surprise"
ON public.guestbook_entries FOR INSERT
TO anon, authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.surprises s
  WHERE s.id = guestbook_entries.surprise_id
    AND s.is_published = true
    AND (s.publish_at IS NULL OR s.publish_at <= now())
    AND (s.expires_at IS NULL OR s.expires_at > now())
));

-- Storage policies for the surprise-media bucket (files live under {owner_id}/...)
DROP POLICY IF EXISTS "Owners read own surprise media" ON storage.objects;
CREATE POLICY "Owners read own surprise media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'surprise-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owners upload own surprise media" ON storage.objects;
CREATE POLICY "Owners upload own surprise media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'surprise-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owners update own surprise media" ON storage.objects;
CREATE POLICY "Owners update own surprise media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'surprise-media' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'surprise-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owners delete own surprise media" ON storage.objects;
CREATE POLICY "Owners delete own surprise media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'surprise-media' AND auth.uid()::text = (storage.foldername(name))[1]);
