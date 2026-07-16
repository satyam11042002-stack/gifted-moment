import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSurpriseBySlug } from "@/lib/surprises-public.functions";
import { RevealEnvelope } from "@/components/momently/RevealEnvelope";
import { CountdownRing } from "@/components/momently/CountdownRing";
import { ThemedShell } from "@/components/momently/ThemedShell";
import { Guestbook } from "@/components/momently/Guestbook";
import { CinematicLoader } from "@/components/momently/CinematicLoader";
import { HeroCover } from "@/components/momently/HeroCover";
import { FloatingMusic } from "@/components/momently/FloatingMusic";
import { PhotoGallery } from "@/components/momently/PhotoGallery";
import { LetterReveal } from "@/components/momently/LetterReveal";
import { EndingCelebration } from "@/components/momently/EndingCelebration";
import { occasionGreeting, formatCountdown } from "@/lib/momently";
import { supabase } from "@/integrations/supabase/client";
import { motion, useScroll, useSpring } from "framer-motion";

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
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const expired = s.expires_at ? new Date(s.expires_at).getTime() <= Date.now() : false;
  const scheduled = s.publish_at ? new Date(s.publish_at).getTime() > Date.now() : false;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id && data.user.id === s.owner_id) setIsOwner(true);
    });
  }, [s.owner_id]);

  // Preload cover for smooth hero
  useEffect(() => {
    if (!s.cover_image_url) return;
    const img = new Image();
    img.src = s.cover_image_url;
  }, [s.cover_image_url]);

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
      {loading && (
        <CinematicLoader
          recipientName={s.recipient_name}
          onDone={() => setLoading(false)}
        />
      )}

      <ReadingProgress />

      {s.music_url && (
        <FloatingMusic
          url={s.music_url}
          label={s.music_label}
          autoplay={!!s.autoplay}
          surpriseId={s.id}
        />
      )}

      <HeroCover
        coverUrl={s.cover_image_url}
        recipientName={s.recipient_name}
        occasion={s.occasion}
        title={s.title}
      />

      {s.message && <LetterReveal message={s.message} senderName={s.sender_name} />}

      {s.surprise_photos && s.surprise_photos.length > 0 && (
        <PhotoGallery photos={s.surprise_photos} />
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

      <EndingCelebration senderName={s.sender_name} />
    </ThemedShell>
  );
}

function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[55] h-[2px] origin-left"
      style={{ scaleX, background: "color-mix(in oklab, var(--primary) 90%, transparent)" }}
    />
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
