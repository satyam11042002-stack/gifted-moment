import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getSurpriseBySlug } from "@/lib/surprises-public.functions";
import { RevealEnvelope } from "@/components/momently/RevealEnvelope";
import { CountdownRing } from "@/components/momently/CountdownRing";
import { occasionGreeting, occasionLabel } from "@/lib/momently";
import { motion } from "framer-motion";

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
  const expired = s.expires_at ? new Date(s.expires_at).getTime() <= Date.now() : false;

  if (expired) {
    return (
      <div className="min-h-screen grid place-items-center px-6 bg-background text-center">
        <div className="max-w-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-6">Faded</p>
          <h1 className="font-display italic text-5xl mb-4">This moment has passed.</h1>
          <p className="text-muted-foreground">The 48-hour window has closed. The memory remains.</p>
        </div>
      </div>
    );
  }

  if (!opened) return <RevealEnvelope onOpen={() => setOpened(true)} recipientName={s.recipient_name} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
        {s.cover_image_url && (
          <div className="absolute inset-0 opacity-30">
            <img src={s.cover_image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
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
          <h1 className="font-display italic text-6xl md:text-8xl leading-[0.9] mb-8">
            {s.recipient_name || "You"}
          </h1>
          {s.title && <p className="text-xl text-muted-foreground max-w-xl mx-auto text-pretty">{s.title}</p>}
        </motion.div>
      </section>

      {/* Letter */}
      {s.message && (
        <motion.section
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 py-24 max-w-2xl mx-auto"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-8 text-center">A letter</p>
          <p className="font-display italic text-2xl md:text-3xl leading-relaxed whitespace-pre-wrap text-center text-balance">
            {s.message}
          </p>
        </motion.section>
      )}

      {/* Gallery */}
      {s.surprise_photos && s.surprise_photos.length > 0 && (
        <section className="px-6 py-24 max-w-5xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-8 text-center">Moments</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {s.surprise_photos.map((p: { url: string; caption: string | null }, i: number) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.05 }}
                className="aspect-[4/5] rounded-2xl overflow-hidden bg-accent"
              >
                <img src={p.url} alt={p.caption ?? ""} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Countdown */}
      <section className="px-6 py-24 md:py-32 bg-foreground text-background">
        <div className="max-w-md mx-auto text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-8">
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
    </div>
  );
}
