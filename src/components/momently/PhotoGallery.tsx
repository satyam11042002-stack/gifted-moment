import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Photo = { url: string; caption: string | null };

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const prev = useCallback(
    () => setOpenIdx((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setOpenIdx((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIdx, close, prev, next]);

  if (!photos.length) return null;

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-10 text-center">
        Moments
      </p>

      <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
        {photos.map((p, i) => (
          <motion.button
            key={p.url + i}
            type="button"
            onClick={() => setOpenIdx(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: (i % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.015 }}
            className="mb-4 block w-full break-inside-avoid rounded-2xl overflow-hidden bg-accent shadow-sm hover:shadow-xl transition-shadow group"
          >
            <img
              src={p.url}
              alt={p.caption ?? ""}
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover group-hover:brightness-105 transition"
              style={{ display: "block" }}
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {openIdx !== null && (
          <Lightbox
            photo={photos[openIdx]}
            index={openIdx}
            total={photos.length}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function Lightbox({
  photo,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const touchX = useRef<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] bg-black/92 backdrop-blur-sm grid place-items-center"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? onNext : onPrev)();
        touchX.current = null;
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute top-4 right-4 size-11 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center backdrop-blur"
      >
        <X className="size-5" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous"
            className="hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white place-items-center backdrop-blur"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next"
            className="hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white place-items-center backdrop-blur"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      <motion.img
        key={photo.url}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        src={photo.url}
        alt={photo.caption ?? ""}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[94vw] max-h-[86vh] object-contain rounded-lg shadow-2xl select-none"
        draggable={false}
      />

      <div className="absolute bottom-5 left-0 right-0 text-center text-white/80 text-xs font-mono tracking-widest uppercase pointer-events-none">
        {photo.caption ? <span className="mr-3">{photo.caption}</span> : null}
        {index + 1} / {total}
      </div>
    </motion.div>
  );
}
