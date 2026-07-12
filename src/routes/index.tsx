import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteNav } from "@/components/momently/SiteNav";
import { SiteFooter } from "@/components/momently/SiteFooter";
import { SurprisePreviewCard } from "@/components/momently/SurprisePreviewCard";
import { OCCASIONS } from "@/lib/momently";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Momently — Turn Moments into Memories" },
      { name: "description", content: "Create beautiful, private surprise websites for birthdays, anniversaries, proposals, farewells. Shareable in a click. Gracefully expires in 48 hours." },
      { property: "og:title", content: "Momently — Turn Moments into Memories" },
      { property: "og:description", content: "Beautiful, ephemeral surprise websites for the people who matter most." },
    ],
  }),
  component: Landing,
});

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Hero */}
      <section className="relative px-6 pt-16 md:pt-24 pb-24 md:pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-6">
              Ephemeral · Private · 48 hours
            </p>
            <h1 className="font-display italic text-5xl sm:text-6xl lg:text-8xl tracking-tight text-balance leading-[0.9] mb-8">
              Turn Moments into <span className="text-primary">Memories.</span>
            </h1>
            <p className="max-w-[45ch] text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed mb-10">
              Create beautiful, ephemeral surprise websites for life's biggest celebrations. Private, personalized, and designed to gently disappear.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/create"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
              >
                Create a surprise
              </Link>
              <Link
                to="/s/$slug"
                params={{ slug: "demo" }}
                className="px-8 py-4 border border-border bg-card/50 backdrop-blur-sm rounded-full font-semibold hover:bg-card transition-all"
              >
                See an example
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <SurprisePreviewCard
              occasion="anniversary"
              recipient_name="Sarah & David"
              expires_at={new Date(Date.now() + 47 * 3600 * 1000 + 59 * 60 * 1000).toISOString()}
            />
          </motion.div>
        </div>
      </section>

      {/* Occasions */}
      <motion.section {...fadeIn} className="px-6 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground text-center mb-12">
            Designed for every milestone
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {OCCASIONS.map((o, i) => (
              <span
                key={o.id}
                className={
                  "px-6 py-3 rounded-full text-sm font-medium border transition-colors " +
                  (i === 2
                    ? "bg-primary/10 text-primary border-primary/20 font-semibold"
                    : "bg-card border-border hover:border-primary")
                }
              >
                {o.label}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Ephemeral feature */}
      <section className="px-6 py-24 md:py-32 bg-foreground text-background overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeIn} className="relative">
            <div className="size-64 lg:size-80 mx-auto rounded-full border-2 border-background/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-shimmer-ring" />
              <div className="text-center">
                <span className="font-mono text-6xl tracking-tighter">48:00</span>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mt-2">
                  Hours remaining
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeIn}>
            <h2 className="font-display text-4xl md:text-5xl mb-6">Beautifully Fleeting.</h2>
            <p className="text-lg opacity-70 leading-relaxed mb-8">
              The most special moments aren't meant to last forever. Each Momently page gracefully expires 48 hours after opening, making the experience urgent, private, and truly unforgettable.
            </p>
            <ul className="space-y-4">
              {["One-time reveal experience", "Secure, encrypted link sharing", "Automatic permanent deletion"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <div className="size-1.5 bg-primary rounded-full" />
                  <span className="font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <motion.section {...fadeIn} className="px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="font-display text-4xl mb-4">How it works</h2>
          <p className="text-muted-foreground">Three steps to a perfect surprise.</p>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { n: "01.", h: "Pick the occasion", p: "Choose from a curated collection of premium themes designed for your milestone." },
            { n: "02.", h: "Personalize it", p: "Add photos, a heartfelt letter, and music. Every detail is tuned to fit the relationship." },
            { n: "03.", h: "Share the link", p: "Send the unique URL. Once they open it, the 48-hour countdown begins immediately." },
          ].map((s) => (
            <div key={s.n} className="space-y-4">
              <span className="font-mono text-primary text-sm">{s.n}</span>
              <h4 className="text-xl font-semibold">{s.h}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section {...fadeIn} className="px-6 py-24 md:py-32 border-y border-border">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-10 rounded-[32px] bg-card border border-border">
            <h4 className="font-semibold mb-2">The Simple Start</h4>
            <p className="text-3xl font-display mb-6">Free</p>
            <ul className="space-y-4 mb-10 text-sm text-muted-foreground">
              <li>• 1 active surprise</li>
              <li>• 48-hour expiry</li>
              <li>• Standard themes</li>
            </ul>
            <Link to="/create" className="block w-full py-3 rounded-full border border-border font-medium text-center hover:bg-accent transition-colors">
              Start for free
            </Link>
          </div>
          <div className="p-10 rounded-[32px] bg-primary text-primary-foreground shadow-xl shadow-primary/20">
            <h4 className="font-semibold mb-2">Premium Gift</h4>
            <p className="text-3xl font-display mb-6">$12 <span className="text-base opacity-70 font-sans">/surprise</span></p>
            <ul className="space-y-4 mb-10 text-sm opacity-90">
              <li>• Unlimited photos & music</li>
              <li>• Premium editorial themes</li>
              <li>• Password protection</li>
            </ul>
            <button className="w-full py-3 rounded-full bg-white text-primary font-bold hover:opacity-90 transition-opacity">
              Go Premium
            </button>
          </div>
        </div>
      </motion.section>

      {/* Testimonial */}
      <motion.section {...fadeIn} className="px-6 py-32 md:py-40 text-center">
        <div className="max-w-3xl mx-auto">
          <blockquote className="font-display italic text-3xl md:text-4xl text-balance mb-8">
            "It felt like digital gift wrapping. The moment she opened the link and the music started, it was pure magic."
          </blockquote>
          <cite className="not-italic font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            — Elena Rossi, Designer
          </cite>
        </div>
      </motion.section>

      <SiteFooter />
    </div>
  );
}
