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

const BUCKET = "surprise-media";
const SIGN_TTL = 60 * 60 * 24 * 30; // 30 days

// Signed URLs are stored directly on cover_image_url / photos.url as full https URLs.
// Re-sign if the URL originates from our private bucket and has expired or is close to expiring.
async function refreshSignedUrl(rawUrl: string | null | undefined): Promise<string | null> {
  if (!rawUrl) return rawUrl ?? null;
  try {
    const u = new URL(rawUrl);
    // Supabase signed URL pattern contains /object/sign/<bucket>/<path>?token=...
    const match = u.pathname.match(/\/object\/sign\/([^/]+)\/(.+)$/);
    if (!match || match[1] !== BUCKET) return rawUrl;
    const path = decodeURIComponent(match[2]);
    // Check token expiry
    const token = u.searchParams.get("token");
    let exp: number | null = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
        exp = typeof payload.exp === "number" ? payload.exp : null;
      } catch {}
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (exp && exp - nowSec > 60 * 60 * 24) return rawUrl; // still valid > 1 day
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, SIGN_TTL);
    return data?.signedUrl ?? rawUrl;
  } catch {
    return rawUrl;
  }
}

export const getSurpriseBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: s, error } = await supabase
      .from("surprises")
      .select(
        "id, owner_id, slug, occasion, recipient_name, sender_name, title, message, theme, cover_image_url, music_url, music_label, autoplay, event_at, publish_at, expires_at, is_published, surprise_photos(url, caption, sort_order)",
      )
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!s) return null;
    if (s.surprise_photos) {
      s.surprise_photos.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    // Refresh signed URLs so they stay valid for the surprise's lifetime.
    s.cover_image_url = await refreshSignedUrl(s.cover_image_url);
    s.music_url = await refreshSignedUrl(s.music_url);
    if (s.surprise_photos) {
      s.surprise_photos = await Promise.all(
        s.surprise_photos.map(async (p) => ({ ...p, url: (await refreshSignedUrl(p.url)) ?? p.url })),
      );
    }
    return s;
  });
