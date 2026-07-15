import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "surprise-media";
const SIGN_TTL = 60 * 60 * 24 * 30; // 30 days

function randomId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

export type UploadKind = "cover" | "gallery" | "audio";

export async function uploadFile(
  file: File,
  kind: UploadKind,
  opts: { onProgress?: (pct: number) => void; signal?: AbortSignal } = {},
): Promise<{ url: string; path: string }> {
  const { data: sess } = await supabase.auth.getSession();
  const userId = sess.session?.user.id;
  if (!userId) throw new Error("Sign in required");

  let toUpload: File = file;
  if (file.type.startsWith("image/")) {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: kind === "cover" ? 1.4 : 0.9,
        maxWidthOrHeight: kind === "cover" ? 2000 : 1600,
        useWebWorker: true,
        fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
        onProgress: (p) => opts.onProgress?.(Math.min(60, p * 0.6)),
      });
      toUpload = new File([compressed], file.name, { type: compressed.type });
    } catch {
      // fall back to original on failure
      toUpload = file;
    }
  }

  const ext = toUpload.name.includes(".") ? toUpload.name.split(".").pop() : "bin";
  const path = `${userId}/${kind}/${randomId()}.${ext}`;
  opts.onProgress?.(70);
  const { error } = await supabase.storage.from(BUCKET).upload(path, toUpload, {
    upsert: false,
    contentType: toUpload.type || undefined,
  });
  if (error) throw new Error(error.message);
  opts.onProgress?.(90);
  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGN_TTL);
  if (signErr || !data) throw new Error(signErr?.message ?? "Failed to sign URL");
  opts.onProgress?.(100);
  return { url: data.signedUrl, path };
}
