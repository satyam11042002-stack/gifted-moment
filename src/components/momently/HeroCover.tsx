import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { occasionGreeting, occasionLabel } from "@/lib/momently";

type Props = {
  coverUrl: string | null;
  recipientName: string | null;
  occasion: string;
  title: string | null;
};

export function HeroCover({ coverUrl, recipientName, occasion, title }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.9]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "-40px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden"
    >
      {coverUrl && (
        <>
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10 will-change-transform"
            style={{ y, scale }}
          >
            <img
              src={coverUrl}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              opacity: overlayOpacity,
              background:
                "linear-gradient(to bottom, color-mix(in oklab, var(--background) 40%, transparent) 0%, color-mix(in oklab, var(--background) 20%, transparent) 45%, var(--background) 100%)",
            }}
          />
        </>
      )}

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative max-w-3xl"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary mb-6"
        >
          {occasionLabel(occasion)} · {occasionGreeting(occasion)}
        </motion.p>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.35, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="font-display italic text-6xl md:text-8xl leading-[0.9] mb-6 text-balance"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {recipientName || "You"}
          </motion.h1>
        </div>

        {title && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto text-pretty"
          >
            {title}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute left-1/2 -translate-x-1/2 -bottom-24 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-px"
            style={{ background: "color-mix(in oklab, var(--primary) 60%, transparent)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
