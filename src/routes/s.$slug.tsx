import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getSurpriseBySlug } from "@/lib/surprises-public.functions";
import { RevealEnvelope } from "@/components/momently/RevealEnvelope";
import { CountdownRing } from "@/components/momently/CountdownRing";
import { ThemedShell } from "@/components/momently/ThemedShell";
import { Guestbook } from "@/components/momently/Guestbook";
import { occasionGreeting, occasionLabel, formatCountdown } from "@/lib/momently";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

export const Route = createFileRoute("/s/$slug")({
  loader: async ({ params }) => {
    const s = await getSurpriseBySlug({ data: { slug: params.slug } });
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Momently" }, { name: "robots", content: "noindex" }] };
    const title = `${occasionGreeting(loaderData.occasion)}, ${loaderData.recipient_name || "you"} — Momently`;
    const description = loaderData.title || `A private surprise page from Momently, expiring soon.`;
    return {
      meta: [
        { title }, { name: "description", content: description },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(loaderData.cover_image_url ? [{ property: "og:image", content: loaderData.cover_image_url }] : []),
      ],
    };
  },
  component: SurprisePage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center px-6 bg-background">
      <div className="max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-6">Faded</p>
        <h1 className="font-display italic text-5xl mb-4">This moment has passed.</h1>
        <p className="text-muted-foreground">
          The surprise you're looking for has expired or was never here.
        </p>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center px-6">Something went wrong.</div>
  ),
});

function SurprisePage() {
  const s = Route.useLoaderData();
  const [opened, setOpened] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const expired = s.expires_at ? new Date(s.expires_at).getTime() <= Date.now() : false;
  const scheduled = s.publish_at ? new Date(s.publish_at).getTime() > Date.now() : false;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id && data.user.id === s.owner_id) setIsOwner(true);
    });
  }, [s.owner_id]);

  if (expired) {
    return (
      <ThemedShell themeId={s.theme}>
        <div className="min-h-screen grid place-items-center px-6 text-center">
          <div className="max-w-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-6">Faded</p>
            <h1 className="font-display italic text-5xl mb-4">This moment has passed.</h1>
            <p className="text-muted-foreground">The 48-hour window has closed. The memory remains.</p>
          </div>
        </div>
      </ThemedShell>
    );
  }

  if (scheduled) {
    return (
      <ThemedShell themeId={s.theme}>
        <ScheduledCountdown publishAt={s.publish_at!} recipient={s.recipient_name} />
      </ThemedShell>
    );
  }

  if (!opened) {
    return (
      <ThemedShell themeId={s.theme}>
        <RevealEnvelope onOpen={() => setOpened(true)} recipientName={s.recipient_name} />
      </ThemedShell>
    );
  }

  return (
    <ThemedShell themeId={s.theme}>
      {s.music_url && <MusicPlayer url={s.music_url} label={s.music_label} autoplay={!!s.autoplay} />}

      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
        {s.cover_image_url && (
          <div className="absolute inset-0 opacity-30">
            <img
              src={s.cover_image_url}
              alt=""
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--background) 0%, transparent 40%, var(--background) 100%)", opacity: 0.7 }} />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-3xl"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-6">
            {occasionLabel(s.occasion)} · {occasionGreeting(s.occasion)}
          </p>
          <h1 className="font-display italic text-6xl md:text-8xl leading-[0.9] mb-8" style={{ fontFamily: "var(--font-display)" }}>
            {s.recipient_name || "You"}
          </h1>
          {s.title && <p className="text-xl text-muted-foreground max-w-xl mx-auto text-pretty">{s.title}</p>}
        </motion.div>
      </section>

      {s.message && (
        <motion.section
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 py-24 max-w-2xl mx-auto"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-8 text-center">A letter</p>
          <p className="font-display italic text-2xl md:text-3xl leading-relaxed whitespace-pre-wrap text-center text-balance" style={{ fontFamily: "var(--font-display)" }}>
            {s.message}
          </p>
          {s.sender_name && (
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground text-center">
              — {s.sender_name}
            </p>
          )}
        </motion.section>
      )}

      {s.surprise_photos && s.surprise_photos.length > 0 && (
        <section className="px-6 py-24 max-w-5xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-8 text-center">Moments</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {s.surprise_photos.map((p: { url: string; caption: string | null }, i: number) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: (i % 6) * 0.05 }}
                className="aspect-[4/5] rounded-2xl overflow-hidden bg-accent"
              >
                <img
                  src={p.url}
                  alt={p.caption ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <Guestbook surpriseId={s.id} isOwner={isOwner} />

      <section className="px-6 py-24 md:py-32" style={{ background: "var(--foreground)", color: "var(--background)" }}>
        <div className="max-w-md mx-auto text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-8" style={{ color: "var(--primary)" }}>
            This page will fade
          </p>
          <div className="flex justify-center mb-6">
            <CountdownRing expiresAt={s.expires_at} size={320} />
          </div>
          <p className="text-sm opacity-70 mt-4 text-pretty">
            Save what matters — this moment gracefully disappears when the timer ends.
          </p>
        </div>
      </section>

      <footer className="py-8 text-center">
        <a href="/" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary">
          Made with Momently
        </a>
      </footer>
    </ThemedShell>
  );
}

function MusicPlayer({ url, label, autoplay }: { url: string; label: string | null; autoplay: boolean }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true); // start muted; toggling unmutes and plays

  useEffect(() => {
    if (!autoplay || !ref.current) return;
    // Attempt muted autoplay (allowed by most browsers), user can unmute.
    ref.current.muted = true;
    ref.current.play().catch(() => {});
  }, [autoplay]);

  const toggle = () => {
    if (!ref.current) return;
    const next = !muted;
    setMuted(next);
    ref.current.muted = next;
    if (!next) ref.current.play().catch(() => {});
  };

  return (
    <>
      <audio ref={ref} src={url} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        className="fixed top-4 right-4 z-40 rounded-full bg-background/80 backdrop-blur border border-border p-3 shadow-lg hover:bg-background"
        aria-label={muted ? `Play music${label ? ` — ${label}` : ""}` : "Mute music"}
        title={label ?? undefined}
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </>
  );
}

function ScheduledCountdown({ publishAt, recipient }: { publishAt: string; recipient: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const c = formatCountdown(new Date(publishAt).getTime() - now);
  return (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div className="max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-6">
          Coming soon
        </p>
        <h1 className="font-display italic text-5xl mb-6">
          Something is waiting{recipient ? `, ${recipient}` : ""}.
        </h1>
        <div className="flex justify-center gap-6 font-display text-5xl md:text-6xl">
          <div>
            <div className="tabular-nums">{c.hh}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">hrs</div>
          </div>
          <div>
            <div className="tabular-nums">{c.mm}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">min</div>
          </div>
          <div>
            <div className="tabular-nums">{c.ss}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">sec</div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-8">Come back at the moment.</p>
      </div>
    </div>
  );
}
