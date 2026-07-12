import { motion } from "framer-motion";
import { useState } from "react";

export function RevealEnvelope({ onOpen, recipientName }: { onOpen: () => void; recipientName: string }) {
  const [opening, setOpening] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-background via-accent/40 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-6">A moment for you</p>
        <h1 className="font-display italic text-5xl md:text-6xl leading-tight mb-4">
          {recipientName || "Someone"}
        </h1>
        <p className="text-muted-foreground mb-12 text-pretty">
          A private letter is waiting. Once you open it, the 48-hour window begins.
        </p>

        <motion.button
          onClick={() => { setOpening(true); setTimeout(onOpen, 900); }}
          disabled={opening}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative mx-auto block group"
        >
          <motion.div
            animate={opening ? { rotateX: -180, y: -40 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top center", perspective: 1200 }}
            className="w-64 h-40 rounded-2xl bg-white dark:bg-card shadow-2xl border border-border flex items-center justify-center"
          >
            <span className="font-display italic text-2xl text-primary">Open letter</span>
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  );
}
