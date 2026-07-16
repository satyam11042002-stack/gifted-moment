import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  recipientName: string | null;
  onDone: () => void;
  durationMs?: number;
};

export function CinematicLoader({ recipientName, onDone, durationMs = 2600 }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), durationMs);
    const done = setTimeout(onDone, durationMs + 700);
    return () => {
      clearTimeout(t);
      clearTimeout(done);
    };
  }, [durationMs, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cinematic-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[60] grid place-items-center overflow-hidden"
          style={{ background: "var(--background)" }}
        >
          {/* soft aurora backdrop */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.7, scale: 1.15 }}
            transition={{ duration: 2.6, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, var(--primary) 22%, transparent) 0%, transparent 70%)",
            }}
          />

          <div className="relative text-center px-6">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary mb-8"
            >
              A moment, for you
            </motion.p>

            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                className="font-display italic text-5xl sm:text-7xl md:text-8xl leading-[0.95] text-balance"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {recipientName || "You"}
              </motion.h1>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-10 h-px w-40 origin-left"
              style={{ background: "color-mix(in oklab, var(--primary) 60%, transparent)" }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="mt-6 text-sm text-muted-foreground"
            >
              Opening…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
