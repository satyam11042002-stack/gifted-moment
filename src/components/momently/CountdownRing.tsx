import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/momently";

export function CountdownRing({ expiresAt, size = 320 }: { expiresAt: string | null; size?: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = expiresAt ? new Date(expiresAt).getTime() - now : 48 * 3600 * 1000;
  const total = 48 * 3600 * 1000;
  const pct = Math.max(0, Math.min(1, ms / total));
  const { hh, mm, ss, expired } = formatCountdown(ms);
  const stroke = 2;
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--coral)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          className="animate-shimmer-ring transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-5xl md:text-6xl tracking-tighter tabular-nums">
          {expired ? "00:00" : `${hh}:${mm}`}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60 mt-2">
          {expired ? "This moment has faded" : `${ss}s · Hours remaining`}
        </span>
      </div>
    </div>
  );
}

export function CountdownInline({ expiresAt }: { expiresAt: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = expiresAt ? new Date(expiresAt).getTime() - now : 48 * 3600 * 1000;
  const { hh, mm, ss } = formatCountdown(ms);
  return <span className="font-mono tabular-nums">{hh}:{mm}:{ss}</span>;
}
