import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Pause } from "lucide-react";

type Props = {
  url: string;
  label: string | null;
  autoplay: boolean;
  surpriseId: string;
};

const PREF_KEY = (id: string) => `momently:music:${id}`;
const TARGET_VOL = 0.55;
const FADE_MS = 900;

export function FloatingMusic({ url, label, autoplay, surpriseId }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  const fadeTo = (target: number, onDone?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const start = a.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / FADE_MS);
      a.volume = start + (target - start) * p;
      if (p < 1) fadeRef.current = requestAnimationFrame(step);
      else onDone?.();
    };
    fadeRef.current = requestAnimationFrame(step);
  };

  const start = async () => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0;
    try {
      await a.play();
      setPlaying(true);
      fadeTo(TARGET_VOL);
      setShowLabel(true);
      setTimeout(() => setShowLabel(false), 3500);
    } catch {
      /* blocked */
    }
  };

  const stop = () => {
    const a = audioRef.current;
    if (!a) return;
    fadeTo(0, () => {
      a.pause();
      setPlaying(false);
    });
  };

  const toggle = () => {
    const next = !playing;
    try {
      localStorage.setItem(PREF_KEY(surpriseId), next ? "on" : "off");
    } catch {}
    if (next) start();
    else stop();
  };

  // Restore preference / autoplay attempt
  useEffect(() => {
    let pref: string | null = null;
    try {
      pref = localStorage.getItem(PREF_KEY(surpriseId));
    } catch {}
    const shouldTry = pref === "on" || (pref === null && autoplay);
    if (shouldTry) {
      // Some browsers block unmuted autoplay — swallow failure silently.
      start();
    }
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="auto" />
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
        <AnimatePresence>
          {playing && showLabel && label && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.35 }}
              className="px-3 py-2 rounded-full bg-background/85 backdrop-blur border border-border shadow-lg text-xs font-medium max-w-[60vw] truncate"
            >
              Now playing · {label}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={toggle}
          onMouseEnter={() => playing && label && setShowLabel(true)}
          onMouseLeave={() => setShowLabel(false)}
          whileTap={{ scale: 0.94 }}
          className="relative size-12 rounded-full grid place-items-center bg-background/85 backdrop-blur border border-border shadow-xl hover:shadow-2xl transition-shadow"
          aria-label={playing ? "Pause music" : "Play music"}
          title={label ?? undefined}
        >
          {playing ? (
            <>
              <Pause className="size-4" />
              <span
                aria-hidden
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: "color-mix(in oklab, var(--primary) 25%, transparent)" }}
              />
            </>
          ) : (
            <Music2 className="size-4" />
          )}
        </motion.button>
      </div>
    </>
  );
}
