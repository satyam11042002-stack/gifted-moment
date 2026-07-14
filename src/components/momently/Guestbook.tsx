import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trash2, Heart } from "lucide-react";

type Entry = {
  id: string;
  surprise_id: string;
  name: string;
  emoji: string;
  message: string;
  created_at: string;
};

const EMOJI_CHOICES = ["💛", "🎉", "🌹", "✨", "🥂", "💐", "🎂", "💌", "🌸", "🕯️", "🎈", "💫"];

export function Guestbook({
  surpriseId,
  isOwner = false,
}: {
  surpriseId: string;
  isOwner?: boolean;
}) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💛");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("guestbook_entries")
        .select("*")
        .eq("surprise_id", surpriseId)
        .order("created_at", { ascending: false });
      if (mounted) {
        if (error) toast.error("Couldn't load wishes");
        setEntries((data as Entry[]) ?? []);
      }
    })();

    const channel = supabase
      .channel(`guestbook:${surpriseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook_entries", filter: `surprise_id=eq.${surpriseId}` },
        (payload) => {
          setEntries((prev) => {
            const next = payload.new as Entry;
            if (!prev) return [next];
            if (prev.some((e) => e.id === next.id)) return prev;
            return [next, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "guestbook_entries", filter: `surprise_id=eq.${surpriseId}` },
        (payload) => {
          const old = payload.old as Entry;
          setEntries((prev) => (prev ? prev.filter((e) => e.id !== old.id) : prev));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [surpriseId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return toast.error("Say something kind");
    if (trimmed.length > 500) return toast.error("Keep it under 500 characters");
    setSubmitting(true);
    const { error } = await supabase.from("guestbook_entries").insert({
      surprise_id: surpriseId,
      name: name.trim().slice(0, 60),
      emoji,
      message: trimmed,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setMessage("");
    setName("");
    toast.success("Wish sent");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this wish?")) return;
    const { error } = await supabase.from("guestbook_entries").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Deleted");
  };

  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-3 text-center">
        Guestbook
      </p>
      <h2 className="font-display italic text-4xl md:text-5xl text-center mb-10">
        Leave a wish
      </h2>

      <form
        onSubmit={submit}
        className="rounded-3xl border border-border bg-card p-5 md:p-6 shadow-sm mb-10"
        aria-label="Leave a wish"
      >
        <div className="grid sm:grid-cols-[1fr,auto] gap-3 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={60}
            className="px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
          />
          <select
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            aria-label="Choose an emoji"
            className="px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none text-xl"
          >
            {EMOJI_CHOICES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a warm wish…"
          rows={3}
          maxLength={500}
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-3 gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {message.length}/500
          </span>
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Heart className="size-4" /> {submitting ? "Sending…" : "Send wish"}
          </button>
        </div>
      </form>

      {entries === null ? (
        <div className="grid sm:grid-cols-2 gap-4" aria-busy>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-accent animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-3xl">
          <p className="font-display italic text-2xl mb-2">Be the first to write.</p>
          <p className="text-muted-foreground text-sm">No wishes yet — start the warmth.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.article
                key={e.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="text-3xl mb-2" aria-hidden>
                  {e.emoji}
                </div>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed mb-3">
                  {e.message}
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  — {e.name || "Anonymous"}
                </p>
                {isOwner && (
                  <button
                    onClick={() => remove(e.id)}
                    aria-label="Delete wish"
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
