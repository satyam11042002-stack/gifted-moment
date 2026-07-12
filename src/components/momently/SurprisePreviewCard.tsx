import { CountdownInline } from "./CountdownRing";
import { occasionGreeting } from "@/lib/momently";

type Props = {
  occasion: string;
  recipient_name: string;
  cover_image_url?: string | null;
  expires_at?: string | null;
  className?: string;
};

export function SurprisePreviewCard({ occasion, recipient_name, cover_image_url, expires_at, className }: Props) {
  return (
    <div className={"relative " + (className ?? "")}>
      <div className="absolute -inset-16 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative aspect-[4/5] w-full max-w-sm mx-auto bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-white/10 shadow-2xl p-6 ring-1 ring-black/5 animate-float-slow">
        <div className="w-full aspect-[4/5] rounded-2xl mb-6 overflow-hidden bg-stone-100 dark:bg-white/5">
          {cover_image_url ? (
            <img src={cover_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center bg-gradient-to-br from-primary/10 via-accent to-primary/5">
              <span className="font-display italic text-4xl text-primary/40">momently</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-end">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-tighter text-primary mb-1 truncate">
              {occasionGreeting(occasion)}
            </p>
            <h3 className="font-display text-2xl truncate">{recipient_name || "Someone special"}</h3>
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="font-mono text-[10px] uppercase tracking-tighter text-muted-foreground">Expires in</p>
            <p className="font-mono text-sm"><CountdownInline expiresAt={expires_at ?? null} /></p>
          </div>
        </div>
      </div>
    </div>
  );
}
