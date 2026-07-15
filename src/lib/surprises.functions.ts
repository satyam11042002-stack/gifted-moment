import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { customAlphabet } from "nanoid";

const slugAlphabet = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 10);

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  occasion: z.string().min(1).max(40),
  recipient_name: z.string().max(120).default(""),
  sender_name: z.string().max(120).default(""),
  title: z.string().max(200).default(""), // headline
  message: z.string().max(4000).default(""),
  theme: z.string().max(40).default("boutique"),
  cover_image_url: z.string().url().nullable().optional(),
  music_url: z.string().url().nullable().optional(),
  music_label: z.string().max(120).nullable().optional(),
  autoplay: z.boolean().optional().default(false),
  event_at: z.string().datetime().nullable().optional(),
  photos: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().max(200).optional(),
      }),
    )
    .max(10)
    .default([]),
});

export const upsertSurprise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { photos, id, ...fields } = data;
    let surpriseId = id;

    if (surpriseId) {
      const { error } = await supabase
        .from("surprises")
        .update(fields)
        .eq("id", surpriseId)
        .eq("owner_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const slug = slugAlphabet();
      const { data: inserted, error } = await supabase
        .from("surprises")
        .insert({ ...fields, slug, owner_id: userId })
        .select("id")
        .single();
      if (error || !inserted) throw new Error(error?.message ?? "insert failed");
      surpriseId = inserted.id;
    }

    // Replace photos
    await supabase.from("surprise_photos").delete().eq("surprise_id", surpriseId);
    if (photos.length) {
      const rows = photos.map((p, i) => ({
        surprise_id: surpriseId!,
        url: p.url,
        caption: p.caption ?? null,
        sort_order: i,
      }));
      const { error } = await supabase.from("surprise_photos").insert(rows);
      if (error) throw new Error(error.message);
    }

    const { data: full, error: fetchErr } = await supabase
      .from("surprises")
      .select("id, slug")
      .eq("id", surpriseId)
      .single();
    if (fetchErr || !full) throw new Error(fetchErr?.message ?? "fetch failed");
    return { id: full.id, slug: full.slug };
  });

const publishSchema = z.object({
  id: z.string().uuid(),
  publish_at: z.string().datetime().nullable().optional(),
});

export const publishSurprise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => publishSchema.parse(d))
  .handler(async ({ data, context }) => {
    const startMs = data.publish_at ? new Date(data.publish_at).getTime() : Date.now();
    const expires_at = new Date(startMs + 48 * 3600 * 1000).toISOString();
    const publish_at = data.publish_at ?? null;
    const { error } = await context.supabase
      .from("surprises")
      .update({ is_published: true, publish_at, expires_at })
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true, expires_at, publish_at };
  });

export const deleteSurprise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("surprises")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMySurprises = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("surprises")
      .select(
        "id, slug, occasion, recipient_name, sender_name, title, cover_image_url, is_published, publish_at, expires_at, event_at, created_at",
      )
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMySurprise = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: s, error } = await context.supabase
      .from("surprises")
      .select("*, surprise_photos(id, url, caption, sort_order)")
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .single();
    if (error) throw new Error(error.message);
    return s;
  });
