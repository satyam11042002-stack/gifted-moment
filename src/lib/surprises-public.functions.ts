import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getSurpriseBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: s, error } = await supabase
      .from("surprises")
      .select("id, slug, occasion, recipient_name, title, message, theme, cover_image_url, music_url, expires_at, is_published, surprise_photos(url, caption, sort_order)")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!s) return null;
    // Sort photos client-safe
    if (s.surprise_photos) {
      s.surprise_photos.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    return s;
  });
