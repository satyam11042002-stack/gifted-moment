import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/lib/media";
import { Play, Pause, Upload, X, Music2 } from "lucide-react";
import { toast } from "sonner";

export type MusicSelection = {
  url: string | null;
  label: string | null;
  autoplay: boolean;
};

type Props = {
  value: MusicSelection;
  onChange: (v: MusicSelection) => void;
};

// User asked no placeholder audio — library is intentionally empty.
// Users bring their own MP3 for now; the picker structure is ready for
// a curated royalty-free library to be added later.
const LIBRARY: { id: string; label: string; url: string }[] = [];

export function MusicPicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlaying(false);
    if (value.url) audioRef.current.src = value.url;
  }, [value.url]);

  const toggle = () => {
    if (!value.url) return;
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload an audio file (MP3, WAV, M4A)");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Audio must be under 15 MB");
      return;
    }
    setProgress(0);
    try {
      const { url } = await uploadFile(file, "audio", { onProgress: setProgress });
      onChange({ url, label: file.name.replace(/\.[^.]+$/, ""), autoplay: value.autoplay });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />

      {value.url ? (
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="size-12 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg shadow-primary/20"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{value.label || "Your track"}</p>
            <p className="text-xs text-muted-foreground">Tap play to preview</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ url: null, label: null, autoplay: false })}
            className="p-2 rounded-full hover:bg-accent"
            aria-label="Remove music"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl border border-dashed border-border bg-card py-10 text-center hover:border-primary transition"
        >
          <Upload className="mx-auto size-6 mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Upload an MP3</p>
          <p className="text-xs text-muted-foreground mt-1">Under 15 MB · optional</p>
          {progress !== null && (
            <div className="mx-6 mt-4 h-1 rounded-full bg-accent overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files);
          e.target.value = "";
        }}
      />

      {LIBRARY.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Or pick from the library
          </p>
          <div className="grid gap-2">
            {LIBRARY.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange({ url: t.url, label: t.label, autoplay: value.autoplay })}
                className={
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition " +
                  (value.url === t.url
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50")
                }
              >
                <Music2 className="size-4 text-primary" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {value.url && (
        <label className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card">
          <div>
            <p className="text-sm font-medium">Autoplay on open</p>
            <p className="text-xs text-muted-foreground">
              Starts after the recipient taps to open — respects device policies.
            </p>
          </div>
          <input
            type="checkbox"
            checked={value.autoplay}
            onChange={(e) => onChange({ ...value, autoplay: e.target.checked })}
            className="size-5 accent-primary"
          />
        </label>
      )}
    </div>
  );
}
