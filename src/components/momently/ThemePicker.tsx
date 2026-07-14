import { THEMES } from "@/lib/themes";
import { Check } from "lucide-react";

export function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {THEMES.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={selected}
            className={
              "text-left p-4 rounded-2xl border transition-all group " +
              (selected
                ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                : "border-border hover:border-primary/50")
            }
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1.5">
                {t.swatch.map((c, i) => (
                  <span
                    key={i}
                    className="size-6 rounded-full border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              {selected && (
                <span className="rounded-full bg-primary text-primary-foreground p-1">
                  <Check className="size-3" />
                </span>
              )}
            </div>
            <p className="font-display text-lg leading-tight">{t.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.tagline}</p>
          </button>
        );
      })}
    </div>
  );
}
