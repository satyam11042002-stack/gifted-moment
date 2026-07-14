
CREATE TABLE public.guestbook_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surprise_id uuid NOT NULL REFERENCES public.surprises(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '💛',
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX guestbook_entries_surprise_id_created_at_idx
  ON public.guestbook_entries (surprise_id, created_at DESC);

-- Validation trigger (CHECK can't reference now())
CREATE OR REPLACE FUNCTION public.tg_guestbook_validate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  s public.surprises%ROWTYPE;
BEGIN
  IF length(NEW.message) < 1 OR length(NEW.message) > 500 THEN
    RAISE EXCEPTION 'message must be 1-500 chars';
  END IF;
  IF length(NEW.name) > 60 THEN
    RAISE EXCEPTION 'name too long';
  END IF;
  IF length(NEW.emoji) > 8 THEN
    RAISE EXCEPTION 'emoji too long';
  END IF;
  SELECT * INTO s FROM public.surprises WHERE id = NEW.surprise_id;
  IF NOT FOUND OR s.is_published = false OR (s.expires_at IS NOT NULL AND s.expires_at <= now()) THEN
    RAISE EXCEPTION 'surprise is not accepting wishes';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guestbook_validate
  BEFORE INSERT ON public.guestbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.tg_guestbook_validate();

GRANT SELECT, INSERT ON public.guestbook_entries TO anon;
GRANT SELECT, INSERT, DELETE ON public.guestbook_entries TO authenticated;
GRANT ALL ON public.guestbook_entries TO service_role;

ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wishes on live surprises"
  ON public.guestbook_entries FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.surprises s
    WHERE s.id = guestbook_entries.surprise_id
      AND s.is_published = true
      AND (s.expires_at IS NULL OR s.expires_at > now())
  ));

CREATE POLICY "Anyone can leave a wish on a live surprise"
  ON public.guestbook_entries FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.surprises s
    WHERE s.id = guestbook_entries.surprise_id
      AND s.is_published = true
      AND (s.expires_at IS NULL OR s.expires_at > now())
  ));

CREATE POLICY "Owners can delete wishes on their surprises"
  ON public.guestbook_entries FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.surprises s
    WHERE s.id = guestbook_entries.surprise_id
      AND s.owner_id = auth.uid()
  ));

ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook_entries;
ALTER TABLE public.guestbook_entries REPLICA IDENTITY FULL;
