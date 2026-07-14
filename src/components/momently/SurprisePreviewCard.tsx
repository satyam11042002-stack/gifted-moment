import { CountdownInline } from "./CountdownRing";
import { occasionGreeting } from "@/lib/momently";
import { getTheme, themeCssVars } from "@/lib/themes";

type Props = {
  occasion: string;
  recipient_name: string;
  cover_image_url?: string | null;
  expires_at?: string | null;
  themeId?: string;
  className?: string;
};

export function SurprisePreviewCard({ occasion, recipient_name, cover_image_url, expires_at, themeId, className }: Props) {
  const theme = getTheme(themeId);
  return (
    <div className={"relative " + (className ?? "")}>
      <div className="absolute -inset-16 blur-[100px] rounded-full pointer-events-none" style={{ background: `${theme.tokens.primary}33` }} />
      <div
        style={{ ...themeCssVars(theme), borderRadius: theme.tokens.radius }}
        className="relative aspect-[4/5] w-full max-w-sm mx-auto backdrop-blur-2xl border shadow-2xl p-6 ring-1 ring-black/5 animate-float-slow overflow-hidden"
      >
        {theme.tokens.bgImage && (
          <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: theme.tokens.bgImage }} />
        )}
        <div className="w-full aspect-[4/5] mb-6 overflow-hidden" style={{ borderRadius: `calc(${theme.tokens.radius} - 4px)`, background: theme.tokens.accent }}>
          {cover_image_url ? (
            <img src={cover_image_url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center" style={{ background: `linear-gradient(135deg, ${theme.tokens.primary}20, ${theme.tokens.accent}, ${theme.tokens.primary}0d)` }}>
              <span className="font-display italic text-4xl opacity-40" style={{ color: theme.tokens.primary, fontFamily: theme.tokens.displayFont }}>
                {theme.label.toLowerCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-end">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-tighter mb-1 truncate" style={{ color: theme.tokens.primary }}>
              {occasionGreeting(occasion)}
            </p>
            <h3 className="font-display text-2xl truncate" style={{ fontFamily: theme.tokens.displayFont }}>
              {recipient_name || "Someone special"}
            </h3>
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="font-mono text-[10px] uppercase tracking-tighter opacity-60">Expires in</p>
            <p className="font-mono text-sm"><CountdownInline expiresAt={expires_at ?? null} /></p>
          </div>
        </div>
      </div>
    </div>
  );
}

