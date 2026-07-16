import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";

export function EndingCelebration({ senderName }: { senderName: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const fired = useRef(false);

  useEffect(() => {
    if (!inView || fired.current) return;
    fired.current = true;

    const primary =
      getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() ||
      "#e07a5f";
    const colors = [primary, "#ffffff", "#f8d7c0", "#f4a261"];

    const shoot = (origin: { x: number; y: number }) =>
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 42,
        gravity: 0.9,
        scalar: 0.95,
        ticks: 220,
        origin,
        colors,
      });

    shoot({ x: 0.2, y: 0.75 });
    setTimeout(() => shoot({ x: 0.8, y: 0.75 }), 220);
    setTimeout(() => shoot({ x: 0.5, y: 0.6 }), 450);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative px-6 py-28 md:py-36 text-center overflow-hidden"
    >
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary mb-6"
      >
        With love
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="font-display italic text-3xl sm:text-4xl md:text-5xl leading-tight max-w-2xl mx-auto text-balance"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Thank you for being part of this special moment
        <span className="text-primary"> ❤</span>
      </motion.h2>

      {senderName && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 text-muted-foreground"
        >
          from {senderName}
        </motion.p>
      )}

      <motion.a
        href="/"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="inline-flex items-center gap-2 mt-14 px-4 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-primary hover:border-primary/40 transition"
      >
        <span className="size-1.5 rounded-full bg-primary" />
        Made with Momently
      </motion.a>
    </section>
  );
}
