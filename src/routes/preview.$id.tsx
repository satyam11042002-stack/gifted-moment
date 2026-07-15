import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMySurprise, publishSurprise, deleteSurprise } from "@/lib/surprises.functions";
import { SiteNav } from "@/components/momently/SiteNav";
import { SurprisePreviewCard } from "@/components/momently/SurprisePreviewCard";
import { CountdownInline } from "@/components/momently/CountdownRing";
import { ShareCard } from "@/components/momently/ShareCard";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/preview/$id")({
  head: () => ({ meta: [{ title: "Preview — Momently" }, { name: "robots", content: "noindex" }] }),
  component: Preview,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center text-center px-6">
      <div>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button onClick={reset} className="rounded-full bg-primary text-primary-foreground px-6 py-2">Retry</button>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="min-h-screen grid place-items-center">Not found</div>,
});

function Preview() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [surprise, setSurprise] = useState<Awaited<ReturnType<typeof getMySurprise>> | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchFn = useServerFn(getMySurprise);
  const publish = useServerFn(publishSurprise);
  const del = useServerFn(deleteSurprise);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return navigate({ to: "/auth", replace: true });
      try {
        const s = await fetchFn({ data: { id } });
        setSurprise(s);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Not found");
      } finally { setLoading(false); }
    })();
  }, [id, navigate, fetchFn]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!surprise) return <div className="min-h-screen grid place-items-center">Not found</div>;

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${surprise.slug}` : `/s/${surprise.slug}`;

  const handlePublish = async () => {
    await publish({ data: { id } });
    toast.success("Live for 48 hours");
    const s = await fetchFn({ data: { id } });
    setSurprise(s);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this surprise? This cannot be undone.")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[400px,1fr] gap-12">
        <div>
          <SurprisePreviewCard
            occasion={surprise.occasion}
            recipient_name={surprise.recipient_name}
            cover_image_url={surprise.cover_image_url}
            expires_at={surprise.expires_at}
            themeId={surprise.theme}
          />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-4">
            {surprise.is_published ? "Live" : "Draft"}
          </p>
          <h1 className="font-display text-4xl mb-6">
            {surprise.title || `For ${surprise.recipient_name || "someone special"}`}
          </h1>

          {surprise.is_published ? (
            <ShareCard url={publicUrl} recipientName={surprise.recipient_name} />
          ) : (
            <div className="p-5 rounded-2xl border border-dashed border-border bg-card mb-6">
              <p className="text-sm text-muted-foreground">
                Publish to generate a shareable link and QR code.
              </p>
            </div>
          )}

          {surprise.is_published && surprise.publish_at && new Date(surprise.publish_at).getTime() > Date.now() && (
            <p className="mt-4 text-xs text-primary font-mono">
              Scheduled — goes live in <CountdownInline expiresAt={surprise.publish_at} />
            </p>
          )}
          {surprise.is_published && surprise.expires_at && (!surprise.publish_at || new Date(surprise.publish_at).getTime() <= Date.now()) && (
            <p className="mt-4 text-xs text-muted-foreground font-mono">
              Expires in <CountdownInline expiresAt={surprise.expires_at} />
            </p>
          )}

          <div className="flex gap-3 flex-wrap mt-6">
            {!surprise.is_published && (
              <button onClick={handlePublish}
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                Publish
              </button>
            )}
            <Link to="/dashboard" className="px-6 py-3 rounded-full border border-border font-medium">Dashboard</Link>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full border border-border font-medium">
              View live
            </a>
            <button onClick={handleDelete}
              className="ml-auto px-4 py-3 rounded-full border border-border text-destructive hover:bg-destructive/10 flex items-center gap-2">
              <Trash2 className="size-4" /> Delete
            </button>
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-accent">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">The letter</p>
            <p className="whitespace-pre-wrap font-display italic text-xl leading-relaxed">
              {surprise.message || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
