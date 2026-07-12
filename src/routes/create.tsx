import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { upsertSurprise, publishSurprise } from "@/lib/surprises.functions";
import { OCCASIONS, type OccasionId } from "@/lib/momently";
import { SurprisePreviewCard } from "@/components/momently/SurprisePreviewCard";
import { SiteNav } from "@/components/momently/SiteNav";
import { toast } from "sonner";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "Create a surprise — Momently" }, { name: "robots", content: "noindex" }] }),
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState<OccasionId>("birthday");
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const upsert = useServerFn(upsertSurprise);
  const publish = useServerFn(publishSurprise);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/auth", replace: true });
      else setCheckingAuth(false);
    });
  }, [navigate]);

  if (checkingAuth) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  const steps = ["Occasion", "Details", "Media", "Review"];

  const handlePublish = async () => {
    setBusy(true);
    try {
      const { id, slug } = await upsert({
        data: {
          occasion, recipient_name: recipient, title, message,
          theme: "boutique",
          cover_image_url: coverUrl || null,
          photos: photoUrls.filter(Boolean).map((url) => ({ url })),
        },
      });
      await publish({ data: { id } });
      toast.success("Your surprise is live for 48 hours.");
      navigate({ to: "/s/$slug", params: { slug } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not publish");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr,400px] gap-12">
        <div>
          <div className="flex items-center gap-3 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={"size-8 rounded-full border flex items-center justify-center text-xs font-mono " +
                  (i <= step ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground")}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <span className={"text-sm font-medium " + (i === step ? "" : "text-muted-foreground")}>{s}</span>
                {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div>
              <h1 className="font-display text-4xl mb-2">What are we celebrating?</h1>
              <p className="text-muted-foreground mb-8">Pick the occasion — it sets the tone.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {OCCASIONS.map((o) => (
                  <button key={o.id} onClick={() => setOccasion(o.id)}
                    className={"p-5 rounded-2xl border text-left transition-all " +
                      (occasion === o.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">{o.greeting}</p>
                    <p className="font-display text-xl">{o.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="font-display text-4xl mb-2">Make it theirs.</h1>
              <p className="text-muted-foreground mb-8">A name, a title, a letter.</p>
              <div className="space-y-5">
                <Field label="Recipient name" value={recipient} onChange={setRecipient} placeholder="Sarah" />
                <Field label="Title (optional)" value={title} onChange={setTitle} placeholder="For the woman who changed my world" />
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Letter</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8}
                    placeholder="Write what you'd say if the room were quiet…"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none resize-none" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="font-display text-4xl mb-2">Add the visuals.</h1>
              <p className="text-muted-foreground mb-8">Paste image URLs — hero + up to 6 gallery photos.</p>
              <Field label="Cover image URL" value={coverUrl} onChange={setCoverUrl} placeholder="https://..." />
              <div className="mt-6 space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Gallery URLs (one per line)</label>
                <textarea rows={6}
                  value={photoUrls.join("\n")}
                  onChange={(e) => setPhotoUrls(e.target.value.split("\n"))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none resize-none font-mono text-sm" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="font-display text-4xl mb-2">Ready to share?</h1>
              <p className="text-muted-foreground mb-8">
                Publishing generates a private link. It expires 48 hours from now.
              </p>
              <div className="p-6 rounded-2xl border border-border bg-card space-y-2">
                <Row k="Occasion" v={OCCASIONS.find(o => o.id === occasion)?.label ?? ""} />
                <Row k="Recipient" v={recipient || "—"} />
                <Row k="Letter" v={`${message.length} characters`} />
                <Row k="Photos" v={String(photoUrls.filter(Boolean).length)} />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-12">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
              className="px-6 py-3 rounded-full border border-border font-medium disabled:opacity-40">
              Back
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)}
                className="px-8 py-3 rounded-full bg-foreground text-background font-medium">
                Continue
              </button>
            ) : (
              <button onClick={handlePublish} disabled={busy}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 disabled:opacity-60">
                {busy ? "Publishing…" : "Publish surprise"}
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Live preview</p>
          <SurprisePreviewCard
            occasion={occasion}
            recipient_name={recipient}
            cover_image_url={coverUrl || null}
            expires_at={new Date(Date.now() + 48 * 3600 * 1000).toISOString()}
          />
          <Link to="/dashboard" className="block text-center text-xs text-muted-foreground mt-6 hover:text-primary">
            Save & continue later
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none" />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
