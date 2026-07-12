
-- Momently schema: surprises + photos
CREATE TABLE public.surprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occasion text NOT NULL DEFAULT 'birthday',
  recipient_name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  theme text NOT NULL DEFAULT 'boutique',
  cover_image_url text,
  music_url text,
  is_published boolean NOT NULL DEFAULT false,
  opened_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX surprises_owner_idx ON public.surprises(owner_id);
CREATE INDEX surprises_slug_idx ON public.surprises(slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.surprises TO authenticated;
GRANT ALL ON public.surprises TO service_role;
GRANT SELECT ON public.surprises TO anon;

ALTER TABLE public.surprises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own surprises"
  ON public.surprises FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Public can read live surprises"
  ON public.surprises FOR SELECT
  TO anon, authenticated
  USING (
    is_published = true
    AND (
      expires_at IS NULL OR expires_at > now()
    )
  );

CREATE TABLE public.surprise_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surprise_id uuid NOT NULL REFERENCES public.surprises(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX surprise_photos_surprise_idx ON public.surprise_photos(surprise_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.surprise_photos TO authenticated;
GRANT ALL ON public.surprise_photos TO service_role;
GRANT SELECT ON public.surprise_photos TO anon;

ALTER TABLE public.surprise_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own photos"
  ON public.surprise_photos FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.surprises s WHERE s.id = surprise_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.surprises s WHERE s.id = surprise_id AND s.owner_id = auth.uid()));

CREATE POLICY "Public reads photos of live surprises"
  ON public.surprise_photos FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.surprises s
    WHERE s.id = surprise_id
      AND s.is_published = true
      AND (s.expires_at IS NULL OR s.expires_at > now())
  ));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER surprises_touch_updated_at
  BEFORE UPDATE ON public.surprises
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
