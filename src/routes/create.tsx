import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { upsertSurprise, publishSurprise } from "@/lib/surprises.functions";
import { OCCASIONS, type OccasionId, formatCountdown, occasionLabel } from "@/lib/momently";
import { SurprisePreviewCard } from "@/components/momently/SurprisePreviewCard";
import { SiteNav } from "@/components/momently/SiteNav";
import { ThemePicker } from "@/components/momently/ThemePicker";
import { MediaUploader, type MediaItem } from "@/components/momently/MediaUploader";
import { MusicPicker, type MusicSelection } from "@/components/momently/MusicPicker";
import { useAutosave } from "@/hooks/useAutosave";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "Create a surprise — Momently" }, { name: "robots", content: "noindex" }] }),
  component: CreatePage,
});

type Draft = {
  step: number;
  occasion: OccasionId;
  theme: string;
  recipient: string;
  sender: string;
  headline: string;
  message: string;
  cover: MediaItem | null;
  gallery: MediaItem[];
  music: MusicSelection;
  eventDate: string; // yyyy-mm-dd
  eventTime: string; // HH:mm
  publishMode: "now" | "scheduled";
};

const INITIAL: Draft = {
  step: 0,
  occasion: "birthday",
  theme: "boutique",
  recipient: "",
  sender: "",
  headline: "",
  message: "",
  cover: null,
  gallery: [],
  music: { url: null, label: null, autoplay: false },
  eventDate: "",
  eventTime: "",
  publishMode: "now",
};

const STEPS = ["Occasion", "Details", "Media", "Music", "Theme", "Schedule", "Review"] as const;
const MAX_LETTER = 1200;
const MAX_HEADLINE = 120;

function CreatePage() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [draft, setDraft, clearDraft] = useAutosave<Draft>("momently:create-draft:v2", INITIAL);
  const [busy, setBusy] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const upsert = useServerFn(upsertSurprise);
  const publish = useServerFn(publishSurprise);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/auth", replace: true });
      else setCheckingAuth(false);
    });
  }, [navigate]);

  const set = <K extends keyof Draft>(key: K, val: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const step = draft.step;
  const goto = (n: number) => setDraft((d) => ({ ...d, step: Math.max(0, Math.min(STEPS.length - 1, n)) }));

  // Validation
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!draft.recipient.trim()) e.recipient = "Add a recipient name";
    if (!draft.sender.trim()) e.sender = "Add your name so they know it's from you";
    if (!draft.cover) e.cover = "Upload a cover photo";
    if (!draft.message.trim()) e.message = "Write a short letter";
    if (draft.publishMode === "scheduled") {
      const iso = combineDateTime(draft.eventDate, draft.eventTime);
      if (!iso) e.schedule = "Pick a date to schedule";
      else if (new Date(iso).getTime() <= Date.now())
        e.schedule = "Scheduled time must be in the future";
    }
    return e;
  }, [draft]);

  const canPublish = Object.keys(errors).length === 0;

  const scheduledIso = combineDateTime(draft.eventDate, draft.eventTime);

  const handlePublish = async () => {
    if (!canPublish) {
      setShowErrors(true);
      toast.error("A few details need attention");
      return;
    }
    setBusy(true);
    try {
      const { id } = await upsert({
        data: {
          occasion: draft.occasion,
          recipient_name: draft.recipient.trim(),
          sender_name: draft.sender.trim(),
          title: draft.headline.trim(),
          message: draft.message.trim(),
          theme: draft.theme,
          cover_image_url: draft.cover?.url ?? null,
          music_url: draft.music.url,
          music_label: draft.music.label,
          autoplay: draft.music.autoplay,
          event_at: scheduledIso,
          photos: draft.gallery.map((p) => ({ url: p.url })),
        },
      });
      await publish({
        data: {
          id,
          publish_at: draft.publishMode === "scheduled" ? scheduledIso : null,
        },
      });
      toast.success(
        draft.publishMode === "scheduled"
          ? "Scheduled — we'll go live at your chosen time."
          : "Your surprise is live for 48 hours.",
      );
      clearDraft();
      navigate({ to: "/preview/$id", params: { id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not publish");
    } finally {
      setBusy(false);
    }
  };

  if (checkingAuth)
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-16">
      <SiteNav />

      {/* Progress bar */}
      <div className="sticky top-[65px] z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            <span>
              Step {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </span>
            <span className="hidden sm:inline">{STEPS[step]}</span>
          </div>
          <div className="h-1 rounded-full bg-accent overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 grid lg:grid-cols-[1fr,380px] gap-8 lg:gap-12">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <StepOccasion value={draft.occasion} onChange={(v) => set("occasion", v)} />
              )}
              {step === 1 && (
                <StepDetails
                  draft={draft}
                  set={set}
                  showErrors={showErrors}
                  errors={errors}
                />
              )}
              {step === 2 && (
                <StepMedia
                  cover={draft.cover}
                  onCover={(v) => set("cover", v)}
                  gallery={draft.gallery}
                  onGallery={(v) => set("gallery", v)}
                  showErrors={showErrors}
                  errors={errors}
                />
              )}
              {step === 3 && (
                <StepMusic value={draft.music} onChange={(v) => set("music", v)} />
              )}
              {step === 4 && (
                <StepTheme value={draft.theme} onChange={(v) => set("theme", v)} />
              )}
              {step === 5 && (
                <StepSchedule
                  draft={draft}
                  set={set}
                  scheduledIso={scheduledIso}
                  showErrors={showErrors}
                  errors={errors}
                />
              )}
              {step === 6 && (
                <StepReview draft={draft} goto={goto} errors={errors} scheduledIso={scheduledIso} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live preview */}
        <aside className="hidden lg:block lg:sticky lg:top-[140px] h-fit">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Live preview
          </p>
          <SurprisePreviewCard
            occasion={draft.occasion}
            recipient_name={draft.recipient}
            cover_image_url={draft.cover?.url ?? null}
            expires_at={
              draft.publishMode === "scheduled" && scheduledIso
                ? new Date(new Date(scheduledIso).getTime() + 48 * 3600 * 1000).toISOString()
                : new Date(Date.now() + 48 * 3600 * 1000).toISOString()
            }
            themeId={draft.theme}
          />
          <Link
            to="/dashboard"
            className="block text-center text-xs text-muted-foreground mt-6 hover:text-primary"
          >
            Save draft & continue later
          </Link>
        </aside>
      </div>

      {/* Sticky nav */}
      <div className="fixed md:static bottom-0 inset-x-0 z-40 md:z-auto bg-background/95 backdrop-blur border-t md:border-t-0 border-border md:bg-transparent">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-0 flex items-center gap-3">
          <button
            type="button"
            onClick={() => goto(step - 1)}
            disabled={step === 0}
            className="flex-1 md:flex-none px-6 py-3 rounded-full border border-border font-medium disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => goto(step + 1)}
              className="flex-1 md:flex-none px-8 py-3 rounded-full bg-foreground text-background font-medium"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={busy}
              className="flex-1 md:flex-none px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {busy
                ? "Publishing…"
                : draft.publishMode === "scheduled"
                  ? "Schedule surprise"
                  : "Publish surprise"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- STEP: Occasion ---------- */
function StepOccasion({ value, onChange }: { value: OccasionId; onChange: (v: OccasionId) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl mb-2">What are we celebrating?</h1>
      <p className="text-muted-foreground mb-8">Pick the occasion — it sets the tone.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={
              "p-5 rounded-2xl border text-left transition-all min-h-[88px] " +
              (value === o.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50")
            }
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">
              {o.greeting}
            </p>
            <p className="font-display text-xl">{o.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- STEP: Details ---------- */
function StepDetails({
  draft,
  set,
  showErrors,
  errors,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  showErrors: boolean;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Make it theirs.</h1>
      <p className="text-muted-foreground mb-8">A name, a title, a letter.</p>
      <div className="space-y-5">
        <Field
          label="Recipient name"
          required
          value={draft.recipient}
          onChange={(v) => set("recipient", v)}
          placeholder="Sarah"
          error={showErrors ? errors.recipient : undefined}
        />
        <Field
          label="Your name (sender)"
          required
          value={draft.sender}
          onChange={(v) => set("sender", v)}
          placeholder="From, Jamie"
          error={showErrors ? errors.sender : undefined}
        />
        <Field
          label="Short headline (optional)"
          value={draft.headline}
          onChange={(v) => set("headline", v.slice(0, MAX_HEADLINE))}
          placeholder="For the woman who changed my world"
          hint={`${draft.headline.length}/${MAX_HEADLINE}`}
        />
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Personal letter <span className="text-destructive">*</span>
            </label>
            <span className="text-[10px] font-mono text-muted-foreground">
              {draft.message.length}/{MAX_LETTER}
            </span>
          </div>
          <textarea
            value={draft.message}
            onChange={(e) => set("message", e.target.value.slice(0, MAX_LETTER))}
            rows={8}
            placeholder="Write what you'd say if the room were quiet…"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none resize-none text-base"
          />
          {showErrors && errors.message && <FieldError text={errors.message} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- STEP: Media ---------- */
function StepMedia({
  cover,
  onCover,
  gallery,
  onGallery,
  showErrors,
  errors,
}: {
  cover: MediaItem | null;
  onCover: (v: MediaItem | null) => void;
  gallery: MediaItem[];
  onGallery: (v: MediaItem[]) => void;
  showErrors: boolean;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Add the visuals.</h1>
      <p className="text-muted-foreground mb-8">
        One cover, up to 10 gallery photos. Upload directly from your device.
      </p>
      <MediaUploader
        cover={cover}
        onCoverChange={onCover}
        gallery={gallery}
        onGalleryChange={onGallery}
      />
      {showErrors && errors.cover && <FieldError text={errors.cover} />}
    </div>
  );
}

/* ---------- STEP: Music ---------- */
function StepMusic({ value, onChange }: { value: MusicSelection; onChange: (v: MusicSelection) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Set the mood.</h1>
      <p className="text-muted-foreground mb-8">Optional. Upload an MP3 — preview before you commit.</p>
      <MusicPicker value={value} onChange={onChange} />
    </div>
  );
}

/* ---------- STEP: Theme ---------- */
function StepTheme({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Choose a theme.</h1>
      <p className="text-muted-foreground mb-8">The whole page reshapes around it — preview updates live.</p>
      <ThemePicker value={value} onChange={onChange} />
    </div>
  );
}

/* ---------- STEP: Schedule ---------- */
function StepSchedule({
  draft,
  set,
  scheduledIso,
  showErrors,
  errors,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  scheduledIso: string | null;
  showErrors: boolean;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl mb-2">When's the moment?</h1>
      <p className="text-muted-foreground mb-8">
        Publish now, or schedule the reveal for the exact time.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <button
          type="button"
          onClick={() => set("publishMode", "now")}
          className={
            "p-5 rounded-2xl border text-left transition min-h-[92px] " +
            (draft.publishMode === "now"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50")
          }
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">
            Publish now
          </p>
          <p className="font-display text-xl">Send immediately</p>
          <p className="text-xs text-muted-foreground mt-1">Live for 48 hours from publish.</p>
        </button>
        <button
          type="button"
          onClick={() => set("publishMode", "scheduled")}
          className={
            "p-5 rounded-2xl border text-left transition min-h-[92px] " +
            (draft.publishMode === "scheduled"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50")
          }
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">
            Schedule
          </p>
          <p className="font-display text-xl">Reveal at the moment</p>
          <p className="text-xs text-muted-foreground mt-1">
            Hidden until the time you set — then live for 48 hours.
          </p>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Event date {draft.publishMode === "scheduled" && <span className="text-destructive">*</span>}
          </label>
          <input
            type="date"
            value={draft.eventDate}
            onChange={(e) => set("eventDate", e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none text-base"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Event time (optional)
          </label>
          <input
            type="time"
            value={draft.eventTime}
            onChange={(e) => set("eventTime", e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none text-base"
          />
        </div>
      </div>

      {draft.publishMode === "scheduled" && scheduledIso && !errors.schedule && (
        <ScheduledCountdown iso={scheduledIso} />
      )}
      {showErrors && errors.schedule && <FieldError text={errors.schedule} />}
    </div>
  );
}

function ScheduledCountdown({ iso }: { iso: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const c = formatCountdown(new Date(iso).getTime() - now);
  return (
    <div className="mt-8 p-6 rounded-2xl border border-primary/30 bg-primary/5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">
        Going live in
      </p>
      <div className="flex gap-4 font-display text-4xl md:text-5xl">
        <Slot v={c.hh} label="hrs" />
        <Slot v={c.mm} label="min" />
        <Slot v={c.ss} label="sec" />
      </div>
    </div>
  );
}
function Slot({ v, label }: { v: string; label: string }) {
  return (
    <div>
      <div className="tabular-nums">{v}</div>
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/* ---------- STEP: Review ---------- */
function StepReview({
  draft,
  goto,
  errors,
  scheduledIso,
}: {
  draft: Draft;
  goto: (n: number) => void;
  errors: Record<string, string>;
  scheduledIso: string | null;
}) {
  const startMs =
    draft.publishMode === "scheduled" && scheduledIso ? new Date(scheduledIso).getTime() : Date.now();
  const expiresAt = new Date(startMs + 48 * 3600 * 1000);
  const totalMediaBytes = (draft.cover ? 1 : 0) + draft.gallery.length;
  const estLoad = Math.max(0.5, totalMediaBytes * 0.4).toFixed(1);

  const problems = Object.values(errors);

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Ready to share?</h1>
      <p className="text-muted-foreground mb-8">Everything below — one tap away from live.</p>

      {problems.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl border border-destructive/40 bg-destructive/5">
          <p className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
            <AlertCircle className="size-4" /> Please fix these before publishing:
          </p>
          <ul className="text-sm text-destructive/90 list-disc pl-6 space-y-1">
            {problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <ReviewRow label="Occasion" value={occasionLabel(draft.occasion)} onEdit={() => goto(0)} />
        <ReviewRow
          label="Recipient"
          value={draft.recipient || "—"}
          onEdit={() => goto(1)}
          missing={!draft.recipient}
        />
        <ReviewRow
          label="Sender"
          value={draft.sender || "—"}
          onEdit={() => goto(1)}
          missing={!draft.sender}
        />
        {draft.headline && (
          <ReviewRow label="Headline" value={draft.headline} onEdit={() => goto(1)} />
        )}
        <ReviewRow
          label="Letter"
          value={draft.message ? `${draft.message.slice(0, 80)}${draft.message.length > 80 ? "…" : ""}` : "—"}
          onEdit={() => goto(1)}
          missing={!draft.message}
        />

        <ReviewCard label="Cover image" onEdit={() => goto(2)}>
          {draft.cover ? (
            <img src={draft.cover.url} alt="cover" className="w-full aspect-[16/9] object-cover rounded-xl" />
          ) : (
            <p className="text-sm text-destructive">No cover uploaded</p>
          )}
        </ReviewCard>

        {draft.gallery.length > 0 && (
          <ReviewCard label={`Gallery (${draft.gallery.length})`} onEdit={() => goto(2)}>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {draft.gallery.map((p) => (
                <img key={p.url} src={p.url} alt="" className="aspect-square object-cover rounded-md" />
              ))}
            </div>
          </ReviewCard>
        )}

        <ReviewRow
          label="Music"
          value={draft.music.url ? `${draft.music.label ?? "Custom track"}${draft.music.autoplay ? " · autoplay" : ""}` : "None"}
          onEdit={() => goto(3)}
        />
        <ReviewRow label="Theme" value={draft.theme} onEdit={() => goto(4)} />
        <ReviewRow
          label="Date & time"
          value={
            scheduledIso
              ? new Date(scheduledIso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: draft.eventTime ? "short" : undefined })
              : "Not set"
          }
          onEdit={() => goto(5)}
        />
        <ReviewRow
          label="Publishing"
          value={draft.publishMode === "scheduled" ? "Scheduled reveal" : "Publish now"}
          onEdit={() => goto(5)}
        />
        <ReviewRow
          label="Expires"
          value={expiresAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        />
        <ReviewRow label="Estimated loading" value={`~${estLoad}s`} />
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
  missing,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  missing?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card">
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={"font-medium truncate " + (missing ? "text-destructive" : "")}>{value}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-primary"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="size-4" />
        </button>
      )}
    </div>
  );
}
function ReviewCard({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-primary"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="size-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ---------- helpers ---------- */
function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        {hint && <span className="text-[10px] font-mono text-muted-foreground">{hint}</span>}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          "w-full mt-1 px-4 py-3 rounded-xl border bg-card focus:border-primary outline-none text-base " +
          (error ? "border-destructive" : "border-border")
        }
      />
      {error && <FieldError text={error} />}
    </div>
  );
}
function FieldError({ text }: { text: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle className="size-3.5" /> {text}
    </p>
  );
}

function combineDateTime(date: string, time: string): string | null {
  if (!date) return null;
  const t = time || "12:00";
  const d = new Date(`${date}T${t}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
