import { motion, useScroll, useSpring } from "framer-motion";
import { useMemo, useRef } from "react";

type Props = {
  message: string;
  senderName: string | null;
};

export function LetterReveal({ message, senderName }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.2"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 0.4 });

  const lines = useMemo(
    () => message.split(/\n+/).flatMap((p) => p.split(/(?<=[.!?])\s+/)).filter(Boolean),
    [message],
  );

  return (
    <section ref={ref} className="relative px-6 py-32 max-w-2xl mx-auto">
      {/* reading progress rail */}
      <div
        aria-hidden
        className="absolute left-6 top-32 bottom-32 w-px overflow-hidden rounded-full"
        style={{ background: "color-mix(in oklab, var(--primary) 12%, transparent)" }}
      >
        <motion.div
          className="w-full origin-top"
          style={{
            scaleY: progress,
            height: "100%",
            background: "color-mix(in oklab, var(--primary) 90%, transparent)",
          }}
        />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-10 text-center">
        A letter
      </p>

      <div className="space-y-5 font-display italic text-2xl md:text-[1.75rem] leading-relaxed text-center text-balance"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      {senderName && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-14 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center"
        >
          — {senderName}
        </motion.p>
      )}
    </section>
  );
}
